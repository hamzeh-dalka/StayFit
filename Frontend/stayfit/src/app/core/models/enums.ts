export enum Role {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Coach = 'Coach',
  Client = 'Client'
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum Specialty {
  Nutrition = 'Nutrition',
  WeightLoss = 'WeightLoss',
  MuscleGain = 'MuscleGain',
  StrengthTraining = 'StrengthTraining',
  Cardio = 'Cardio',
  Rehabilitation = 'Rehabilitation',
  GeneralFitness = 'GeneralFitness',
  SportsPerformance = 'SportsPerformance'
}

export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack'
}

export enum GoalType {
  WeightLoss = 'WeightLoss',
  MuscleGain = 'MuscleGain',
  Maintenance = 'Maintenance'
}

export enum CoachClientStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected'
}

export enum NotificationType {
  CoachRequestReceived = 'CoachRequestReceived',
  CoachRequestAccepted = 'CoachRequestAccepted',
  PlanAssigned = 'PlanAssigned',
  MessageReceived = 'MessageReceived',
  GoalAchieved = 'GoalAchieved',
  MissedLogReminder = 'MissedLogReminder',
  WeeklyReportReady = 'WeeklyReportReady'
}
