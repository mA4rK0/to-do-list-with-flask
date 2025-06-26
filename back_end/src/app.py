from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'task': self.task,
            'completed': self.completed
        }


with app.app_context():
    db.create_all()


@app.route("/api/addToDoList", methods=['POST'])
def add_new_list():
    if request.method == 'POST':
        data = request.get_json()
        if not data or 'task' not in data:
            return jsonify({"error": "Not a valid data"}), 400

        new_todo = Todo(task=data['task'])
        db.session.add(new_todo)
        db.session.commit()

        return jsonify(new_todo.to_dict()), 201


@app.route("/api/getToDoList", methods=['GET'])
def get_list():
    todos = Todo.query.all()
    return jsonify([todo.to_dict() for todo in todos])


@app.route("/api/updateToDoList/<int:todo_id>", methods=['PUT'])
def update_list(todo_id):
    todo = Todo.query.get(todo_id)

    if not todo:
        return jsonify({"error": "List not found"}), 404

    data = request.get_json()

    if 'task' in data:
        todo.task = data['task']

    if 'completed' in data:
        todo.completed = data['completed']

    db.session.commit()

    return jsonify(todo.to_dict())


@app.route("/api/deleteToDoList/<int:todo_id>", methods=['DELETE'])
def delete_list(todo_id):
    todo = Todo.query.get(todo_id)

    if not todo:
        return jsonify({"error": "List not found"}), 404

    db.session.delete(todo)
    db.session.commit()

    return jsonify(todo.to_dict())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
