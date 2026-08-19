import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Users, UserDto } from '../../../core/services/users';
import { Role } from '../../../core/models/enums';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { AddAdminDialog } from '../add-admin-dialog/add-admin-dialog';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage implements OnInit {
  private usersService = inject(Users);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  Role = Role;

  search = new FormControl('', { nonNullable: true });

  users: UserDto[] = [];
  loading = true;
  pageNumber = 1;
  hasNextPage = false;

  ngOnInit(): void {
    this.load();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pageNumber = 1;
        this.load();
      });
  }

  isSuperAdmin(role: Role): boolean {
    return role === Role.SuperAdmin;
  }

  prevPage(): void {
    if (this.pageNumber <= 1) return;
    this.pageNumber -= 1;
    this.load();
  }

  nextPage(): void {
    if (!this.hasNextPage) return;
    this.pageNumber += 1;
    this.load();
  }

  openAddAdminDialog(): void {
    const ref = this.dialog.open(AddAdminDialog, { width: '420px', panelClass: 'app-dialog-panel' });
    ref.afterClosed().subscribe((created: boolean) => {
      if (created) {
        this.pageNumber = 1;
        this.load();
      }
    });
  }

  confirmDelete(user: UserDto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '360px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'Delete user',
        message: 'Delete this user permanently? This cannot be undone.',
        confirmLabel: 'Delete',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.deleteUser(user);
    });
  }

  private deleteUser(user: UserDto): void {
    this.usersService.deletePermanently(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.snackBar.open('User deleted', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: (err) => {
        const message =
          typeof err?.error === 'string' ? err.error : 'Something went wrong deleting that user.';
        this.snackBar.open(message, 'Close', { duration: 4000, panelClass: 'app-snackbar' });
      },
    });
  }

  private load(): void {
    this.loading = true;
    const name = this.search.value.trim() || undefined;

    this.usersService.getAll({ name, pageNumber: this.pageNumber, pageSize: PAGE_SIZE }).subscribe({
      next: (users) => {
        this.users = users;
        this.hasNextPage = users.length === PAGE_SIZE;
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.hasNextPage = false;
        this.loading = false;
      },
    });
  }
}
