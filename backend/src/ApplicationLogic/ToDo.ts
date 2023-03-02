import { TodoItem } from '../models/TodoItem';
import { parseUserId } from '../auth/utils';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoUpdate } from '../models/TodoUpdate';
import { ToDoAccess } from '../dataLayer/ToDoAccess';
import { v4 as uuidv4 } from 'uuid';

const toDoAccess = new ToDoAccess();

export async function getAllToDoItems(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken);
  return toDoAccess.getAllToDoItems(userId);
}

export function createTodoitem(todoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
  const userId = parseUserId(jwtToken);
  const todoId = uuidv4();
  const s3BucketName = process.env.S3_BUCKET_NAME;
  const createdAt = new Date().toISOString();

  const newTodoItem: TodoItem = {
    todoId: todoId,
    userId: userId,
    createdAt: createdAt,
    done: false,
    attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
    ...todoRequest
  };

  return toDoAccess.createTodoitem(newTodoItem);
}

export function updateToDoitem(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateTodoitem(updateTodoRequest, todoId, userId);
}

export function deleteToDoitem(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteToDoitem(todoId, userId);
}

export function GetUploadUrl(todoId: string): Promise<string> {
    return toDoAccess.GetUploadUrl(todoId);
}
