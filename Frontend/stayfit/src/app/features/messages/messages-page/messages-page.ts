import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Messages, MessageDto } from '../../../core/services/messages';
import { CoachClient } from '../../../core/services/coach-client';
import { AuthService } from '../../../core/services/auth';
import { Role, CoachClientStatus } from '../../../core/models/enums';

interface ContactVm {
  userId: number;
  name: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss',
})
export class MessagesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messagesService = inject(Messages);
  private coachClientService = inject(CoachClient);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  @ViewChild('messageList') private messageListRef?: ElementRef<HTMLDivElement>;

  contacts = signal<ContactVm[]>([]);
  loadingContacts = signal(true);

  selectedUserId = signal<number | null>(null);
  messages = signal<MessageDto[]>([]);
  loadingThread = signal(false);
  sending = signal(false);
  draft = signal('');

  currentUserId = computed(() => this.authService.currentUser()?.id ?? null);
  selectedContact = computed(
    () => this.contacts().find((c) => c.userId === this.selectedUserId()) ?? null,
  );
  isCoach = computed(() => this.authService.currentRole() === Role.Coach);
  browsePath = computed(() => (this.isCoach() ? null : '/coaches-browse'));

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const raw = params.get('userId');
      const userId = raw ? Number(raw) : null;
      this.selectedUserId.set(userId);
      this.draft.set('');
      if (userId !== null) {
        this.loadThread(userId);
      } else {
        this.messages.set([]);
      }
    });

    this.loadContacts();
  }

  initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  selectContact(userId: number): void {
    if (userId === this.selectedUserId()) return;
    this.router.navigate(['/messages', userId]);
  }

  isMine(message: MessageDto): boolean {
    return message.senderId === this.currentUserId();
  }

  formatBubbleTime(sentAt: string): string {
    const date = new Date(sentAt);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    if (isToday) return time;
    return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`;
  }

  sendMessage(): void {
    const content = this.draft().trim();
    const receiverId = this.selectedUserId();
    if (!content || receiverId === null || this.sending()) return;

    this.sending.set(true);
    this.messagesService.send({ receiverId, content }).subscribe({
      next: (message) => {
        this.messages.update((list) => [...list, message]);
        this.draft.set('');
        this.sending.set(false);
        this.updateContactPreview(receiverId, message.content, message.sentAt);
        this.scrollToBottom();
      },
      error: () => {
        this.sending.set(false);
        this.snackBar.open('Message failed to send. Try again.', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
    });
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private loadContacts(): void {
    this.loadingContacts.set(true);
    const source$ =
      this.authService.currentRole() === Role.Coach
        ? this.coachClientService.getMyClients()
        : this.coachClientService.getMyCoaches();

    source$.subscribe({
      next: (relationships) => {
        const contacts = relationships
          .filter((r) => r.status === CoachClientStatus.Accepted)
          .map((r) => ({ userId: r.userId, name: r.name, lastMessage: null, lastMessageAt: null }));
        this.contacts.set(contacts);
        this.loadingContacts.set(false);
        this.loadPreviews(contacts);
      },
      error: () => this.loadingContacts.set(false),
    });
  }

  private loadPreviews(contacts: ContactVm[]): void {
    contacts.forEach((contact) => this.refreshPreview(contact.userId));
  }

  private refreshPreview(userId: number): void {
    this.messagesService.getConversation(userId).subscribe({
      next: (thread) => {
        if (thread.length === 0) return;
        const last = thread[thread.length - 1];
        this.updateContactPreview(userId, last.content, last.sentAt);
      },
      error: () => undefined,
    });
  }

  private updateContactPreview(userId: number, content: string, sentAt: string): void {
    this.contacts.update((list) =>
      list.map((c) => (c.userId === userId ? { ...c, lastMessage: content, lastMessageAt: sentAt } : c)),
    );
  }

  private loadThread(userId: number): void {
    this.loadingThread.set(true);
    this.messagesService.getConversation(userId).subscribe({
      next: (thread) => {
        this.messages.set(thread);
        this.loadingThread.set(false);
        this.markUnreadAsRead(thread, userId);
        this.scrollToBottom();
      },
      error: () => this.loadingThread.set(false),
    });
  }

  private markUnreadAsRead(thread: MessageDto[], otherUserId: number): void {
    const myId = this.currentUserId();
    const unread = thread.filter((m) => !m.isRead && m.senderId === otherUserId && m.receiverId === myId);

    unread.forEach((message) => {
      this.messagesService.markAsRead(message.id).subscribe({
        next: () => {
          this.messages.update((list) =>
            list.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)),
          );
        },
        error: () => undefined,
      });
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messageListRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
