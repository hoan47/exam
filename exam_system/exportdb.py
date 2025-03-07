import json
from exam_system.db import get_db

# Kết nối database
db = get_db()

# Lấy danh sách tất cả collections trong database
collections = db.list_collection_names()

# Xuất dữ liệu từ tất cả collections
export_data = {}
for collection in collections:
    export_data[collection] = list(db[collection].find({}))  # Giữ cả `_id`

# Lưu vào file JSON
with open("db_export.json", "w", encoding="utf-8") as f:
    json.dump(export_data, f, indent=4, default=str)

print("✅ Database exported to db_export.json successfully!")
