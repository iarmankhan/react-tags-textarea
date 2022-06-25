import { ReactNode } from "react";
import {
  MENTION_REGEX,
  TAG_MENTIONS_REGEX,
  TAG_REGEX,
} from "./constants";
import {
  TagRecord,
  TagSuggestion,
  TagType,
} from "./types";

const getTags = (value: string): string[] => {
  const tags = value.match(TAG_MENTIONS_REGEX);

  return tags ? tags.map((tag) => tag.trim()) : [];
};

const shouldCallSearch = (value: string): boolean => {
  let flag = false;

  for (let i = value.length - 1; i >= 0; i -= 1) {
    if (value[i] === " " || value[i] === "\n") {
      break;
    } else if (
      (value[i] === "@" || value[i] === "#") &&
      i !== value.length - 1
    ) {
      flag = !value?.[i - 1] || value[i - 1] === " ";
      break;
    }
  }

  return flag;
};

const formatTags = (value: string, shouldAddLastSpace: boolean) => {
  const words = value.match(/\S+/g) || [];

  const formattedWords: ReactNode[] = [];
  words.forEach((word, index) => {
    const isLastWord = index === words.length - 1;

    if (!word.startsWith("@") && !word.startsWith("#")) {
      return isLastWord
        ? formattedWords.push(word)
        : formattedWords.push(`${word} `);
    }

    // const mention = (
    //   <span
    //     // eslint-disable-next-line react/no-array-index-key
    //     key={word + index}
    //     style={{
    //       fontWeight: "bold",
    //       ...(word.startsWith("#") && {
    //         color: "blue",
    //       }),
    //       ...(word.startsWith("@") && {
    //         color: "green",
    //       }),
    //     }}
    //   >
    //     {word}
    //   </span>
    // );

    const mention = word

    return isLastWord && !shouldAddLastSpace
      ? formattedWords.push(mention)
      : formattedWords.push(mention, " ");
  });

  return formattedWords;
};

const findLastIndex = (str: string, matcher = "@") => {
  for (let i = str.length - 1; i >= 0; i -= 1) {
    if (str[i] === matcher) {
      return i;
    }
  }
  return -1;
};

const addTag = (
  tagOrMention: string,
  value: string,
  cursorPos: number,
  type: TagType = "user"
): string => {
  const valueTillCursor = value.slice(0, cursorPos);
  const tags = valueTillCursor.match(
    type === "topic" ? TAG_REGEX : MENTION_REGEX
  );

  if (tags && tags.length) {
    const matcher = type === "topic" ? "#" : "@";

    const lastIndex = findLastIndex(valueTillCursor, matcher);
    return `${valueTillCursor.substring(
      0,
      lastIndex
    )}${tagOrMention} ${value.substring(
      lastIndex + tags[tags.length - 1].length
    )}`;
  }

  return value;
};

const serializeText = (value: string, tags: TagRecord) => {
  const tagKeys: string[] = [];
  const tagValues: string[] = [];

  Object.keys(tags).forEach((key) => {
    tagKeys.push(`\\{${key}\\}`);
    tagValues.push(tags[key].text);
  });

  let serializedText = value;

  tagValues.forEach((tag, i) => {
    serializedText = serializedText.replace(new RegExp(tag, "g"), tagKeys[i]);
  });

  return serializedText;
};

const generateTags = (
  newTag: {
    id: string;
    value: string;
    type: TagType;
  },
  currentValue: string,
  currentTags: TagRecord,
  cursorPos: number
) => {
  const prefix = newTag.type === "user" ? "u" : "t";
  const key = `${prefix}${Object.keys(currentTags).length + 1}`;

  const newTags: TagRecord = {
    ...currentTags,
    [key]: {
      position: key,
      id: newTag.id,
      text: newTag.value,
    },
  };

  const newFormattedValue = addTag(
    newTag.value,
    currentValue,
    cursorPos,
    newTag.type
  );

  return {
    newTags,
    newFormattedValue,
  };
};

const filterTags = (value: string, tags: TagRecord): TagRecord => {
  const tagsInValue = getTags(value);
  const filteredTags: TagRecord = {};

  Object.keys(tags).forEach((key) => {
    if (tagsInValue.includes(tags[key].text.trim())) {
      filteredTags[key] = tags[key];
    }
  });

  return filteredTags;
};

const getLastTag = (value: string) => {
  const tags = getTags(value);

  return tags.length ? tags[tags.length - 1] : "";
};

const selectTag = (tag: string, tags: TagSuggestion[]) =>
  tags.find((t) => t.name === tag.substring(1));

export {
  getTags,
  shouldCallSearch,
  formatTags,
  generateTags,
  filterTags,
  serializeText,
  selectTag,
  getLastTag,
};
