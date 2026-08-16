
import sys
import os
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app, db
from app.routes.admin import seed_admin


if __name__ == "__main__":
    username = "Admin"
    password = "We4climate@003"

    args = iter(sys.argv[1:])
    for arg in args:
        if arg in ("--username", "-u"):
            username = next(args, username)
        elif arg in ("--password", "-p"):
            password = next(args, password)

    app = create_app()
    with app.app_context():
        db.create_all()
        seed_admin(username=username, password=password)
        print(f"\nAdmin login:  username: {username}  /  password: {password}\n")
