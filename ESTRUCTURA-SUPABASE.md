# Próxima etapa: Supabase

## Tablas previstas

### products
- id
- name
- slug
- description
- short_description
- price
- category_id
- production_time
- published
- featured
- created_at
- updated_at

### product_images
- id
- product_id
- image_url
- position

### product_options
- id
- product_id
- name
- type
- required
- values

### categories
- id
- name
- slug

### orders
- id
- order_number
- customer_name
- customer_whatsapp
- delivery_type
- province
- locality
- postal_code
- address
- notes
- total
- deposit
- balance
- status
- created_at

### order_items
- id
- order_id
- product_id
- product_name
- unit_price
- quantity
- options

### store_settings
- id
- whatsapp
- instagram_url
- transfer_alias
- account_holder
- deposit_rate
- shipping_text
- production_time

## Storage

Buckets previstos:

- `products`
- `store`
- `receipts` (opcional)
