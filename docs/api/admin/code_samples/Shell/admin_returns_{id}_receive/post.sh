curl -X POST 'https://medusa-url.com/admin/returns/{id}/receive' \
-H 'Authorization: Bearer {api_token}' \
-H 'Content-Type: application/json' \
--data-raw '{
    "items": [
      {
        "item_id": "asafg",
        "quantity": 1
      }
    ]
}'
