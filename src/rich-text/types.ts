export interface TagValue {
  id: string;
  text: string;
  position: string;
}

export interface RichTextValue {
  serializedText: string;
  formattedText: string;

  users: Record<string, TagValue>;
  topics: Record<string, TagValue>;
}

export type TagType = "user" | "topic";

export type TagSuggestion = {
  id: string;
  name: string;
};

export type TagRecord = Record<string, TagValue>;
