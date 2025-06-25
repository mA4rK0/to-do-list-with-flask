from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

todos = []
next_id = 1


def find_list(todo_id):
    for index, todo in enumerate(todos):
        if todo['id'] == todo_id:
            return todo, index
    return None, -1


@app.route("/api/addToDoList", methods=['GET', 'POST'])
def add_new_list():
    global next_id

    if request.method == 'POST':
        data = request.get_json()
        if not data or 'task' not in data:
            return jsonify({"error": "Not a valid data"}), 400

        new_todo = {
            "id": next_id,
            "task": data['task'],
            "completed": False
        }
        todos.append(new_todo)
        next_id += 1
        return jsonify(new_todo), 201

    print("success")
    return jsonify(todos)


@app.route("/api/getToDoList", methods=['GET'])
def get_list():
    return jsonify(todos)


@app.route("/api/updateToDoList/<int:todo_id>", methods=['PUT'])
def update_list(todo_id):
    todo, index = find_list(todo_id)

    if todo is None:
        return jsonify({"error": "List not found"}), 404

    data = request.get_json()

    if 'task' in data:
        todo['task'] = data['task']

    if 'completed' in data:
        todo['completed'] = data['completed']

    todos[index] = todo

    return jsonify(todo)


@app.route("/api/deleteToDoList/<int:todo_id>", methods=['DELETE'])
def delete_list(todo_id):
    todo, index = find_list(todo_id)

    if todo is None:
        return jsonify({"error": "List not found"}), 404

    todos.pop(index)

    return jsonify(todo)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
