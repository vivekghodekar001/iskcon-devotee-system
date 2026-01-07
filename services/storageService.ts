import { supabase } from '../lib/supabaseClient';
import { Session, Notification, UserProfile } from '../types';

export const storageService = {
  // PROFILES (Student ERP)
  createProfile: async (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name: profile.name,
        spiritual_name: profile.spiritualName,
        email: profile.email,
        phone: profile.phone,
        photo_url: profile.photoUrl,
        dob: profile.dob,
        native_place: profile.nativePlace,
        current_address: profile.currentAddress,
        branch: profile.branch,
        year_of_study: profile.yearOfStudy,
        intro_video_url: profile.introVideoUrl,
        hobbies: profile.hobbies,
        skills: profile.skills,
        goals: profile.goals,
        interests: profile.interests,
        role: profile.role,
        category: profile.category
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getProfileByEmail: async (email: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      spiritualName: data.spiritual_name,
      email: data.email,
      phone: data.phone,
      photoUrl: data.photo_url,
      dob: data.dob,
      nativePlace: data.native_place,
      currentAddress: data.current_address,
      branch: data.branch,
      yearOfStudy: data.year_of_study,
      introVideoUrl: data.intro_video_url,
      hobbies: data.hobbies,
      skills: data.skills,
      goals: data.goals,
      role: data.role,
      category: data.category,
      createdAt: data.created_at
    };
  },

  getAllProfiles: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      spiritualName: d.spiritual_name,
      email: d.email,
      phone: d.phone,
      photoUrl: d.photo_url,
      dob: d.dob,
      nativePlace: d.native_place,
      currentAddress: d.current_address,
      branch: d.branch,
      yearOfStudy: d.year_of_study,
      introVideoUrl: d.intro_video_url,
      hobbies: d.hobbies,
      skills: d.skills,
      goals: d.goals,
      interests: d.interests,
      role: d.role,
      category: d.category,
      createdAt: d.created_at
    }));
  },
  // SESSIONS
  getSessions: async (): Promise<Session[]> => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      date: d.date,
      location: d.location,
      facilitator: d.facilitator,
      type: d.type,
      status: d.status,
      attendeeIds: d.attendee_ids || []
    }));
  },

  createSession: async (session: Session) => {
    const { error } = await supabase
      .from('sessions')
      .insert({
        title: session.title,
        description: session.description,
        date: session.date,
        location: session.location,
        facilitator: session.facilitator,
        type: session.type,
        status: session.status,
        attendee_ids: session.attendeeIds
      });
    if (error) throw error;
  },

  updateSession: async (session: Session) => {
    const { error } = await supabase
      .from('sessions')
      .update({
        title: session.title,
        description: session.description,
        date: session.date,
        location: session.location,
        facilitator: session.facilitator,
        type: session.type,
        status: session.status,
        attendee_ids: session.attendeeIds
      })
      .eq('id', session.id);
    if (error) throw error;
  },

  // HOMEWORK
  getHomeworkBySession: async (sessionId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      sessionId: d.session_id,
      title: d.title,
      description: d.description,
      fileUrl: d.file_url,
      dueDate: d.due_date
    }));
  },

  createHomework: async (homework: any) => {
    const { error } = await supabase
      .from('homework')
      .insert({
        session_id: homework.sessionId,
        title: homework.title,
        description: homework.description,
        file_url: homework.fileUrl,
        due_date: homework.dueDate
      });
    if (error) throw error;
  },

  submitHomework: async (submission: any) => {
    const { error } = await supabase
      .from('submissions')
      .insert({
        homework_id: submission.homeworkId,
        student_id: submission.studentId,
        file_url: submission.fileUrl,
        status: 'Submitted',
        submitted_at: new Date().toISOString()
      });
    if (error) throw error;
  },

  // QUIZZES
  getQuizzes: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      topic: d.topic,
      questions: d.questions,
      createdAt: d.created_at
    }));
  },

  createQuiz: async (quiz: any) => {
    const { error } = await supabase
      .from('quizzes')
      .insert({
        topic: quiz.topic,
        questions: quiz.questions,
        session_id: quiz.sessionId
      });
    if (error) throw error;
  },

  // RESOURCES (Digital Library)
  getResources: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      category: d.category,
      url: d.url,
      thumbnailUrl: d.thumbnail_url
    }));
  },

  createResource: async (resource: any) => {
    const { error } = await supabase
      .from('resources')
      .insert({
        title: resource.title,
        type: resource.type,
        category: resource.category,
        url: resource.url,
        thumbnail_url: resource.thumbnailUrl
      });
    if (error) throw error;
  },

  // MENTORSHIP
  getMentors: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor')
      .order('name');

    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      spiritualName: d.spiritual_name,
      photoUrl: d.photo_url,
      phone: d.phone,
      branch: d.branch
    }));
  },

  createMentorshipRequest: async (studentId: string, mentorId: string, message: string) => {
    const { error } = await supabase
      .from('mentorship_requests')
      .insert({
        student_id: studentId,
        mentor_id: mentorId,
        message,
        status: 'Pending'
      });
    if (error) throw error;
  },

  createMentor: async (mentor: any) => {
    // Reuse profiles table but set role='mentor'
    const { error } = await supabase
      .from('profiles')
      .insert({
        name: mentor.name,
        spiritual_name: mentor.spiritualName,
        phone: mentor.phone,
        branch: mentor.branch,
        photo_url: mentor.photoUrl,
        email: mentor.email, // Optional for now
        role: 'mentor',
        category: 'Regular' // Default
      });
    if (error) throw error;
  },

  getProfiles: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // NOTIFICATIONS
  getNotifications: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      message: d.message,
      timestamp: new Date(d.timestamp),
      isRead: d.is_read,
      type: d.type
    }));
  },

  createNotification: async (notification: Notification) => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp.toISOString(),
        is_read: notification.isRead,
        type: notification.type
      });
    if (error) throw error;
  },

  markAllNotificationsRead: async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) throw error;
  }
};
