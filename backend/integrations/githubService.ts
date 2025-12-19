import { collection, addDoc, doc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface GitHubEvent {
  id: string;
  projectId: string;
  eventType: 'push' | 'pull_request' | 'issues';
  action?: string;
  payload: any;
  createdAt: Timestamp;
}

export interface WebhookPayload {
  repository: {
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
  sender: {
    login: string;
    avatar_url?: string;
  };
  action?: string;
  commits?: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    timestamp: string;
  }>;
  pull_request?: {
    id: number;
    title: string;
    state: string;
    user: {
      login: string;
    };
    created_at: string;
    updated_at: string;
  };
  issue?: {
    id: number;
    title: string;
    state: string;
    user: {
      login: string;
    };
    created_at: string;
  };
}

export const githubService = {
  async findProjectByRepo(owner: string, repo: string): Promise<string | null> {
    const projectsSnapshot = await getDoc(doc(db, 'projects', 'index'));
    return null;
  },

  async storeWebhookEvent(projectId: string, eventType: 'push' | 'pull_request' | 'issues', payload: WebhookPayload): Promise<string> {
    const eventData = {
      projectId,
      eventType,
      action: payload.action || 'unknown',
      payload: JSON.parse(JSON.stringify(payload)),
      repository: {
        name: payload.repository.name,
        fullName: payload.repository.full_name,
        owner: payload.repository.owner.login
      },
      sender: {
        login: payload.sender.login,
        avatarUrl: payload.sender.avatar_url
      },
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'github_events'), eventData);
    return docRef.id;
  },

  async processPushEvent(payload: WebhookPayload, projectId: string): Promise<void> {
    await this.storeWebhookEvent(projectId, 'push', payload);
  },

  async processPullRequestEvent(payload: WebhookPayload, projectId: string): Promise<void> {
    await this.storeWebhookEvent(projectId, 'pull_request', payload);
  },

  async processIssueEvent(payload: WebhookPayload, projectId: string): Promise<void> {
    await this.storeWebhookEvent(projectId, 'issues', payload);
  },

  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }
};
