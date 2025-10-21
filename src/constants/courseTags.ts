// Predefined course tags with specific IDs from the backend
export interface PredefinedCourseTag {
  tagId: number;
  tagName: string;
}

export const PREDEFINED_COURSE_TAGS: PredefinedCourseTag[] = [
  { tagId: 2, tagName: '.NET' },
  { tagId: 3, tagName: 'Java' },
  { tagId: 4, tagName: 'ReactJS' },
  { tagId: 5, tagName: 'Android (Kotlin)' },
  { tagId: 6, tagName: 'iOS (Swift)' },
  { tagId: 7, tagName: 'DevOps' },
  { tagId: 8, tagName: 'Data Engineering' },
  { tagId: 9, tagName: 'Artificial Intelligence' },
  { tagId: 10, tagName: 'Cyber Security' },
  { tagId: 11, tagName: 'AI & Machine Learning' },
  { tagId: 12, tagName: 'Internet of Things' }
];

// Helper function to get tag ID by name
export const getTagIdByName = (tagName: string): number | null => {
  const tag = PREDEFINED_COURSE_TAGS.find(t => t.tagName === tagName);
  return tag ? tag.tagId : null;
};

// Helper function to get tag name by ID
export const getTagNameById = (tagId: number): string | null => {
  const tag = PREDEFINED_COURSE_TAGS.find(t => t.tagId === tagId);
  return tag ? tag.tagName : null;
};

// Helper function to check if a tag is predefined
export const isPredefinedTag = (tagName: string): boolean => {
  return PREDEFINED_COURSE_TAGS.some(t => t.tagName === tagName);
};

// Map of tag IDs to names for quick lookup
export const TAG_ID_TO_NAME_MAP = PREDEFINED_COURSE_TAGS.reduce((acc, tag) => {
  acc[tag.tagId] = tag.tagName;
  return acc;
}, {} as Record<number, string>);

// Map of tag names to IDs for quick lookup
export const TAG_NAME_TO_ID_MAP = PREDEFINED_COURSE_TAGS.reduce((acc, tag) => {
  acc[tag.tagName] = tag.tagId;
  return acc;
}, {} as Record<string, number>);