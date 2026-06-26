/**
 * EventPilot AI — Backend API Client
 * Centralized API client for all backend calls.
 */

import { APIResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${path}]:`, error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, full_name: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  // Events
  async getEvents() {
    return this.request('/events/');
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  async createEvent(data: Record<string, unknown>) {
    return this.request('/events/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEvent(id: string, data: Record<string, unknown>) {
    return this.request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  }

  async generatePlan(eventId: string) {
    return this.request(`/events/${eventId}/generate-plan`, { method: 'POST' });
  }

  async getEventDashboard(eventId: string) {
    return this.request(`/events/${eventId}/dashboard`);
  }

  // Guests
  async getGuests(eventId: string) {
    return this.request(`/guests/${eventId}`);
  }

  async addGuest(eventId: string, data: Record<string, unknown>) {
    return this.request(`/guests/${eventId}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateGuest(eventId: string, guestId: string, data: Record<string, unknown>) {
    return this.request(`/guests/${eventId}/${guestId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteGuest(eventId: string, guestId: string) {
    return this.request(`/guests/${eventId}/${guestId}`, { method: 'DELETE' });
  }

  async sendInvitations(eventId: string, guestIds: string[], message?: string) {
    return this.request(`/guests/${eventId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ guest_ids: guestIds, message }),
    });
  }

  // Budget
  async getBudgetItems(eventId: string) {
    return this.request(`/budget/${eventId}`);
  }

  async addBudgetItem(eventId: string, data: Record<string, unknown>) {
    return this.request(`/budget/${eventId}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateBudgetItem(eventId: string, itemId: string, data: Record<string, unknown>) {
    return this.request(`/budget/${eventId}/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async getBudgetInsights(eventId: string) {
    return this.request(`/budget/${eventId}/insights`);
  }

  // Vendors
  async getVendors(eventId: string) {
    return this.request(`/vendors/${eventId}`);
  }

  async addVendor(eventId: string, data: Record<string, unknown>) {
    return this.request(`/vendors/${eventId}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async searchNearbyVendors(data: Record<string, unknown>) {
    return this.request('/vendors/search/nearby', { method: 'POST', body: JSON.stringify(data) });
  }

  async getVendorRecommendations(eventId: string, category?: string) {
    return this.request(`/vendors/${eventId}/recommend?category=${category || 'all'}`, { method: 'POST' });
  }

  // Tasks
  async getTasks(eventId: string) {
    return this.request(`/tasks/${eventId}`);
  }

  async createTask(eventId: string, data: Record<string, unknown>) {
    return this.request(`/tasks/${eventId}`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTask(eventId: string, taskId: string, data: Record<string, unknown>) {
    return this.request(`/tasks/${eventId}/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteTask(eventId: string, taskId: string) {
    return this.request(`/tasks/${eventId}/${taskId}`, { method: 'DELETE' });
  }

  // Marketing
  async getMarketingContent(eventId: string) {
    return this.request(`/marketing/${eventId}`);
  }

  async generateMarketingContent(data: Record<string, unknown>) {
    return this.request('/marketing/generate', { method: 'POST', body: JSON.stringify(data) });
  }

  // Schedule
  async generateSchedule(eventId: string, preferences?: string) {
    return this.request('/schedule/generate', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, preferences }),
    });
  }

  // Chat
  async sendChatMessage(content: string, eventId?: string) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ content, event_id: eventId }),
    });
  }

  async getChatHistory(eventId?: string) {
    const query = eventId ? `?event_id=${eventId}` : '';
    return this.request(`/chat/history${query}`);
  }
}

export const api = new ApiClient();
