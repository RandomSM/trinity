# UML Class Diagram - Backend

## User

```
User
----
_id: ObjectId
email: string
password: string (hashed)
firstName: string
lastName: string
phone: string
billing: BillingInfo
isAdmin: boolean
createdAt: Date
----
Methods:
+ hashPassword(password: string): string
+ comparePassword(password: string): boolean
+ generateToken(): string
```

## BillingInfo

```
BillingInfo
----
address: string
zipCode: string
city: string
country: string
```

## Product

```
Product
----
_id: string (barcode)
code: string
product_name: string
brands: string
price: number
image_url: string
image_front_url: string
categories: string
categories_tags: string[]
nutriscore_grade: string
quantity: string
stock: number
nutrition_data_per: string
energy_100g: number
fat_100g: number
saturated_fat_100g: number
carbohydrates_100g: number
sugars_100g: number
proteins_100g: number
salt_100g: number
----
Methods:
+ updateFromOpenFoodFacts(data: any): void
+ isInStock(): boolean
```

## Invoice

```
Invoice
----
_id: ObjectId
userId: ObjectId (ref: User)
paypalOrderId: string
items: InvoiceItem[]
total: number
status: string (pending|paid|cancelled|refunded)
deliveryStatus: string
shipping: ShippingInfo
createdAt: Date
updatedAt: Date
----
Methods:
+ calculateTotal(): number
+ refund(items?: RefundItem[]): Promise<void>
```

## InvoiceItem

```
InvoiceItem
----
productId: string (ref: Product)
name: string
quantity: number
price: number
refunded: boolean
refundedQuantity: number
----
Methods:
+ getSubtotal(): number
```

## ShippingInfo

```
ShippingInfo
----
name: FullName
address: Address
```

## FullName

```
FullName
----
full_name: string
```

## Address

```
Address
----
address_line_1: string
admin_area_2: string (city)
postal_code: string
country_code: string
```

## RefundItem

```
RefundItem
----
index: number
quantity: number
```

## Report

```
Report
----
avgPurchaseValue: number
salesByPeriod: SalesPeriod
trendingProducts: TrendingProduct[]
----
Methods:
+ generate(): Promise<Report>
```

## SalesPeriod

```
SalesPeriod
----
last24Hours: PeriodStats
last7Days: PeriodStats
```

## PeriodStats

```
PeriodStats
----
revenue: number
orders: number
```

## TrendingProduct

```
TrendingProduct
----
productId: string
product: Product
recentQuantity: number
recentRevenue: number
```

## Relations

```
User "1" -- "0..*" Invoice : places
Invoice "1" *-- "1..*" InvoiceItem : contains
InvoiceItem "1" -- "1" Product : references
Invoice "1" *-- "1" ShippingInfo : has
ShippingInfo "1" *-- "1" FullName : has
ShippingInfo "1" *-- "1" Address : has
User "1" *-- "1" BillingInfo : has
Report "1" *-- "1" SalesPeriod : contains
Report "1" *-- "0..*" TrendingProduct : contains
TrendingProduct "1" -- "1" Product : references
```

## Controllers

```
UserController
----
+ register(req, res): Promise<void>
+ login(req, res): Promise<void>
+ getById(req, res): Promise<void>
+ adminEdit(req, res): Promise<void>
+ adminDelete(req, res): Promise<void>
```

```
ProductController
----
+ getAll(req, res): Promise<void>
+ getById(req, res): Promise<void>
+ create(req, res): Promise<void>
+ update(req, res): Promise<void>
+ delete(req, res): Promise<void>
```

```
InvoiceController
----
+ getAll(req, res): Promise<void>
+ getByUserId(req, res): Promise<void>
+ create(req, res): Promise<void>
+ update(req, res): Promise<void>
+ delete(req, res): Promise<void>
+ refund(req, res): Promise<void>
```

```
ReportController
----
+ getLatest(req, res): Promise<void>
+ getTrendingProducts(req, res): Promise<void>
```

```
PayPalController
----
+ createOrder(req, res): Promise<void>
+ captureOrder(req, res): Promise<void>
```
