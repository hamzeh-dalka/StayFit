import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';
import { Role } from '../models/enums';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: Role;
  isApproved: boolean;
}

export interface FilterUsers {
  id?: number;
  name?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SaveUserDto {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class Users extends BaseApi {
  getAll(filter: FilterUsers = {}) {
    return this.get<UserDto[]>('/Users/GetAllUsers', filter);
  }

  getMe() {
    return this.get<UserDto>('/Users/Me');
  }

  updateMe(dto: SaveUserDto) {
    return this.put<UserDto>('/Users/UpdateMe', dto);
  }

  deletePermanently(id: number) {
    return this.delete<void>(`/Users/${id}`);
  }

  getPendingCoaches() {
  return this.get<UserDto[]>('/Users/pending-coaches');
  }

  approveCoach(id: number) {
    return this.put<void>(`/Users/${id}/approve`, {});
  }

  rejectCoach(id: number) {
    return this.delete<void>(`/Users/${id}/reject`);
  }
}
