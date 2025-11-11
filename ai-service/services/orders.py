from db.mongodbClient import get_db

db = get_db()

async def get_orders_for_user(user_id: str):
    """Returns all orders for a user."""
    orders = await db.orders.find({"userId": user_id}).to_list(100)
    return orders