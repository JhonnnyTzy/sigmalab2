import { Request, Response, NextFunction } from "express";
import * as authModel from "../models/authModel";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;
    const result = await authModel.loginUser(identifier, password);
    res.json(result);
  } catch (err) { next(err); }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authModel.getProfile(req.user!.userId);
    res.json(user);
  } catch (err) { next(err); }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authModel.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await authModel.findAllUsers();
    res.json(users);
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authModel.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

export async function removeUser(req: Request, res: Response, next: NextFunction) {
  try {
    await authModel.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authModel.updateProfile(req.user!.userId, req.body);
    res.json(user);
  } catch (err) { next(err); }
}
