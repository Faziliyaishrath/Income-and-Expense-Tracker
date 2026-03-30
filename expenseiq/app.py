import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime   
from flask import session
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from flask import jsonify, session

app = Flask(__name__)

CORS(app,supports_credentials=True)
app.secret_key = 'your_secret_key'  # 👈 Add this line

# ================= DATABASE CONFIG =================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/faziliyaishr/expenseiq/ExpenseIQ.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ================= MODELS =================
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(255))

class Category(db.Model):
    __tablename__ = 'categories' 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    budget = db.Column(db.Float)
    icon = db.Column(db.String(50))
    color = db.Column(db.String(20))

class Transaction(db.Model):
    __tablename__ = 'transactions' 
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10))
    amount = db.Column(db.Float)
    description = db.Column(db.String(255))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    date = db.Column(db.Date)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    target = db.Column(db.Float)
    saved = db.Column(db.Float)
    date = db.Column(db.Date)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))


# ================= ROUTES =================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login_index.html')

@app.route('/signup')
def signup():
    return render_template('signup_index.html')

# ================= API =================
def require_login():
    return 'user_id' in session   

@app.route('/current_user', methods=['GET'])
def current_user():
    if not require_login():
        return jsonify({'user': None})
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if user is None:
        return jsonify({'user': None})
    return jsonify({'user': {
        'id': user.id,
        'name': user.name,
        'email': user.email
    }})

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

# GET transactions
@app.route('/transactions', methods=['GET'])
def get_transactions():
    if not require_login():
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session.get('user_id')

    month = request.args.get('month')  # 👈 get month from frontend

    query = Transaction.query.filter_by(user_id=user_id)

    # ✅ Apply filter only if NOT "all"
    if month and month != "all":
        month = int(month)
        query = query.filter(db.extract('month', Transaction.date) == month)

    transactions = query.all()

    result = []
    for t in transactions:
        result.append({
            "id": t.id,
            "type": t.type,
            "amount": t.amount,
            "description": t.description,
            "categoryId": t.category_id,
            "date": str(t.date)
        })

    return jsonify(result)

# ADD transaction
@app.route('/transactions', methods=['POST'])
def add_transaction():
    if not require_login():   # ✅ ADD HERE
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    print("DATA RECEIVED:", data)   # 👈 DEBUG
    user_id = session.get('user_id')
    try:
        new_trans = Transaction(
            type=data['type'],
            amount=data['amount'],
            description=data['description'],
            category_id=data['categoryId'],
            date=datetime.strptime(data['date'], '%Y-%m-%d'),
            user_id=user_id   # 🔥 IMPORTANT
        )

        db.session.add(new_trans)
        db.session.commit()
        
        return jsonify({"message": "Transaction added"}) 

    except Exception as e:
        print("ERROR:", e)   # 👈 VERY IMPORTANT
        return jsonify({"error": str(e)}), 500
# GET categories
@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()

    result = []
    for c in categories:
        result.append({
            "id": c.id,
            "name": c.name,
            "budget": c.budget,
            "icon": c.icon,
            "color": c.color
        })
    return jsonify(result)

# ADD category
@app.route('/categories', methods=['POST'])
def add_category():
    data = request.json

    new_cat = Category(
        name=data['name'],
        budget=data['budget'],
        icon=data['icon'],
        color=data['color']
    )

    db.session.add(new_cat)
    db.session.commit()

    return jsonify({"message": "Category added"})

# GET goals
@app.route('/goals', methods=['GET'])
def get_goals():
    if not require_login():   # ✅ ADD HERE
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session.get('user_id')
    goals = Goal.query.filter_by(user_id=user_id).all()

    result = []
    for g in goals:
        result.append({
            "id": g.id,
            "name": g.name,
            "target": g.target,
            "saved": g.saved,
            "date": str(g.date)
        })
    return jsonify(result)

# ADD goal
@app.route('/goals', methods=['POST'])
def add_goal():
    if not require_login():   # ✅ ADD HERE
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    user_id = session.get('user_id')
    new_goal = Goal(
        name=data['name'],
        target=data['target'],
        saved=data['saved'],
        date=datetime.strptime(data['date'], '%Y-%m-%d'),
        user_id=user_id
    )

    db.session.add(new_goal)
    db.session.commit()

    return jsonify({"message": "Goal added"})

@app.route('/goals/<int:id>', methods=['DELETE'])
def delete_goal(id):
    try:
        user_id = session.get('user_id')

        goal = Goal.query.filter_by(id=id, user_id=user_id).first()

        if not goal:
            return jsonify({"error": "Goal not found"}), 404

        db.session.delete(goal)
        db.session.commit()

        return jsonify({"message": "Deleted successfully"}), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Delete failed"}), 500

@app.route('/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    if not require_login():
        return jsonify({"error": "Unauthorized"}), 401

    user_id = session.get('user_id')

    transaction = Transaction.query.filter_by(id=id, user_id=user_id).first()

    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    db.session.delete(transaction)
    db.session.commit()

    return jsonify({"message": "Transaction deleted"})

@app.route('/transactions/<int:id>', methods=['PUT'])

def update_transaction(id):
    if not require_login():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    user_id = session.get('user_id')

    transaction = Transaction.query.filter_by(id=id, user_id=user_id).first()

    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    try:
        transaction.type = data['type']
        transaction.amount = data['amount']
        transaction.description = data['description']
        transaction.category_id = data['categoryId']
        transaction.date = datetime.strptime(data['date'], '%Y-%m-%d')

        db.session.commit()

        return jsonify({"message": "Transaction updated"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# signup api

@app.route('/signup', methods=['POST'])
def signup_user():
    data = request.json

    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created"})

# login api 

@app.route('/login', methods=['POST'])
def login_user():
    data = request.json

    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        session['user_id'] = user.id   # 🔥 IMPORTANT
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid credentials"}), 401
# ================= RUN =================
if __name__ == '__main__':
    app.run(debug=True)