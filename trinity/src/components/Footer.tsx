export default function Footer() {
  return (
    <footer className="bg-primary text-primary-content py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; 2025 OpenFoodMarket</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-secondary">Facebook</a>
          <a href="#" className="hover:text-secondary">Instagram</a>
          <a href="#" className="hover:text-secondary">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
