import { Router } from "express";
import { connectDB } from "../lib/mongodb";
import { ObjectId } from "mongodb"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken, requireAdmin, requireOwnerOrAdmin, AuthRequest } from "../middleware/auth";
import logger from "../lib/logger";

const usersRoutes = Router();
const SECRET = process.env.JWT_SECRET!;

// Admin only - Get all users
usersRoutes.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection("users").find({}).toArray();

    const safeUsers = users.map((u) => ({
      _id: u._id,
      email: u.email,
      password: u.password,
      firstName: u.firstName || null,
      lastName: u.lastName || null,
      phone: u.phone || null,
      billing: u.billing || { address: null, zipCode: null, city: null, country: null },
      isAdmin: u.isAdmin || false,
    }));

    res.json(safeUsers);
  } catch (err) {
    logger.error("GET /users error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Public - User login
usersRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  logger.info('Login request received:', { email, passwordLength: password?.length });
  
  const db = await connectDB();
  const users = db.collection("users");

  if (!email || !password) {
    logger.warn('Login failed: Missing credentials');
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  const user = await users.findOne({ email });
  if (!user) {
    logger.warn('Login failed: User not found for email:', email);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn('Login failed: Password mismatch for email:', email);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, SECRET, { expiresIn: "1d" });
  logger.info('Login successful for:', email);

  res.json({ 
    token, 
    user: { 
      _id: user._id, 
      email: user.email, 
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      phone: user.phone || null,
      billing: user.billing || { address: null, zipCode: null, city: null, country: null },
      isAdmin: user.isAdmin 
    } 
  });
});

// Public - User registration
usersRoutes.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, billing } = req.body;
    const db = await connectDB();
    const users = db.collection("users");

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      billing: billing || { address: null, zipCode: null, city: null, country: null },
      isAdmin: false,
    };
    const result = await users.insertOne(newUser);

    res.status(201).json(result);
  } catch (err) {
    logger.error("POST /users/register error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// User can edit their own profile, admin can edit any
usersRoutes.put("/edit", authenticateToken, requireOwnerOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id, email, firstName, lastName, phone, billing, password } = req.body;
    if (!id) return res.status(400).json({ error: "ID requis" });

    const db = await connectDB();
    const updateData: any = {};
    if (email) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (billing !== undefined) updateData.billing = billing;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Profil mis à jour avec succès" });
  } catch (err) {
    logger.error("PUT /users error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// User can delete their own account, admin can delete any
usersRoutes.delete("/delete", authenticateToken, requireOwnerOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID requis" });

    const db = await connectDB();
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    logger.error("DELETE /users error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Admin only - Edit any user
usersRoutes.put("/admin-edit/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { email, name, isAdmin } = req.body;

    if (!id) return res.status(400).json({ error: "ID requis" });

    const db = await connectDB();
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (typeof isAdmin === "boolean") updateData.isAdmin = isAdmin;

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur modifié avec succès" });
  } catch (err) {
    logger.error("PUT /users/admin-edit error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// User can view their own profile, admin can view any
usersRoutes.get("/:id", authenticateToken, requireOwnerOrAdmin, async (req: AuthRequest, res) => {
  try {
    logger.info(`GET /users/:id - Recherche utilisateur avec ID: ${req.params.id}`);
    const db = await connectDB();
    
    const { id } = req.params;
    
    // Vérifie si l'ID est un ObjectId valide
    if (!id || !ObjectId.isValid(id)) {
      logger.warn(`ID invalide: ${id}`);
      return res.status(400).json({ error: "ID invalide" });
    }
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      logger.warn(`Utilisateur non trouve pour l'ID: ${id}`);
      
      // Vérifie combien d'utilisateurs existent
      const count = await db.collection("users").countDocuments();
      logger.info(`Nombre total d'utilisateurs dans la base: ${count}`);
      
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    logger.info(`Utilisateur trouve: ${user.email}`);
    const safeUser = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      phone: user.phone || null,
      billing: user.billing || { address: null, zipCode: null, city: null, country: null },
      isAdmin: user.isAdmin || false,
    };

    res.json(safeUser);
  } catch (err) {
    logger.error("GET /users/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Admin only - Delete any user
usersRoutes.delete("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    logger.error("DELETE /users/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default usersRoutes;
