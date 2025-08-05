export interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  location: string;
  organizerId: string;
  interests?: string[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: Date;
  location?: string;
  interests?: string[];
}

export interface Event {
  id: string;
  title: string | null;
  description: string | null;
  date: Date;
  location: string | null;
  organizerId: string | null;
  interests: string[] | null;
  createdAt: Date | null;
}

export interface EventWithOrganizer {
  event: Event;
  organizer: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    username: string | null;
    bio: string | null;
    createdAt: Date | null;
  };
}

export interface EventParticipant {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    username: string | null;
    bio: string | null;
    createdAt: Date | null;
  };
  joinedAt: Date | null;
}

export interface EventReview {
  review: {
    id: string;
    eventId: string | null;
    userId: string | null;
    rating: number | null;
    comment: string | null;
    createdAt: Date | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    username: string | null;
    bio: string | null;
    createdAt: Date | null;
  };
}

export interface EventDetails extends EventWithOrganizer {
  participants: EventParticipant[];
  reviews: EventReview[];
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchEventsParams {
  query: string;
  page?: number;
  limit?: number;
}

export interface GetEventsByInterestParams {
  interest: string;
  page?: number;
  limit?: number;
}

export interface SearchEventsByInterestsParams {
  interests: string[];
  page?: number;
  limit?: number;
}

export interface JoinEventParams {
  userId: string;
  eventId: string;
}

export interface AddEventReviewParams {
  eventId: string;
  userId: string;
  rating: number;
  comment: string;
}
