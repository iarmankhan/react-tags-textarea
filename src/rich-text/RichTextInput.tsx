import {FC, useCallback, useEffect, useMemo, useRef} from 'react';
import {RichTextValue, TagRecord, TagSuggestion, TagType} from "./types";
import {
    filterTags,
    formatTags,
    generateTags,
    getLastTag,
    getTags,
    selectTag,
    serializeText,
    shouldCallSearch
} from "./utils";
import {Suggestions} from "./suggestions";

interface RichTextInputProps {
    value: RichTextValue;
    onChange: (value: RichTextValue) => void;

    onTagSuggestion: (tag: string) => void;
    onMentionSuggestion: (mention: string) => void;

    topicTags: TagSuggestion[];
    userTags: TagSuggestion[];
}

const RichTextInput: FC<RichTextInputProps> = ({
                                                   onTagSuggestion,
                                                   onMentionSuggestion,
                                                   topicTags,
                                                   userTags,
                                                   value,
                                                   onChange,
                                               }) => {
    const cursorPos = useRef(0);
    const selectedUsers = useRef<TagRecord>({});
    const selectedTopics = useRef<TagRecord>({});
    const suggestionPressed = useRef(false);

    const formattedText = useMemo(() => {
        const text = formatTags(value.formattedText, suggestionPressed.current);
        suggestionPressed.current = false;
        return text;
    }, [value.formattedText]);

    const shouldShowSuggestions = useMemo(
        () =>
            !!value.formattedText &&
            value.formattedText[value.formattedText.length - 1] !== " " &&
            !["@", "#"].includes(value.formattedText[value.formattedText.length - 1]),
        [value.formattedText]
    );

    const search = useCallback((tag: string) => {
        if (tag.length <= 2) return;

        const tagType = tag[0] === "@" ? "username" : "hashtag";
        const tagWithoutAt = tag.slice(1);

        if (tagType === "username") {
            onMentionSuggestion(tagWithoutAt);
        } else {
            onTagSuggestion(tagWithoutAt);
        }
    }, []);

    useEffect(() => {
        const valueTillCursor = value.formattedText.substring(0, cursorPos.current);
        const foundTags = getTags(valueTillCursor);

        if (
            foundTags.length &&
            shouldShowSuggestions &&
            shouldCallSearch(valueTillCursor)
        ) {
            const lastTag = foundTags[foundTags.length - 1].trim();

            if (lastTag[0] === "@") {
                selectedUsers.current = filterTags(
                    value.formattedText,
                    selectedUsers.current
                );
            } else {
                selectedTopics.current = filterTags(
                    value.formattedText,
                    selectedTopics.current
                );
            }

            search(lastTag);
        }
    }, [value.formattedText]);

    const insertTag = useCallback(
        (currentFormattedText: string, {id, name}: TagSuggestion, type: TagType) => {
            suggestionPressed.current = true;

            const {newTags, newFormattedValue} = generateTags(
                {
                    id,
                    value: type === "user" ? `@${name}` : `#${name}`,
                    type,
                },
                currentFormattedText,
                type === "user" ? selectedUsers.current : selectedTopics.current,
                cursorPos.current
            );

            if (type === "user") {
                selectedUsers.current = newTags;

                onMentionSuggestion("");
            } else {
                selectedTopics.current = newTags;
                onTagSuggestion("");
            }

            onChange({
                formattedText: newFormattedValue,
                users: selectedUsers.current,
                topics: selectedTopics.current,
                serializedText: serializeText(newFormattedValue, {
                    ...selectedUsers.current,
                    ...selectedTopics.current,
                }),
            });
        },
        []
    );

    const autoSelectTag = useCallback(
        (newValue: string) => {
            const lastTag = getLastTag(newValue);

            if (!lastTag) return;

            const tagType: TagType = lastTag[0] === "@" ? "user" : "topic";

            const selectedTag = selectTag(
                lastTag,
                tagType === "user" ? userTags : topicTags
            );

            if (selectedTag) {
                // console.log(selectedTag);
                insertTag(newValue, selectedTag, tagType);
            }
        },
        [userTags, topicTags]
    );

    return (
        <>
            <textarea
                autoFocus
                placeholder="Write something here..."
                onChange={(event) => {
                    const newValue = event.target.value
                    console.log(newValue)
                    onChange({
                        formattedText: newValue,
                        users: selectedUsers.current,
                        topics: selectedTopics.current,
                        serializedText: serializeText(newValue, {
                            ...selectedUsers.current,
                            ...selectedTopics.current,
                        }),
                    });

                    if (newValue.length && newValue[cursorPos.current - 1] === " ") {
                        autoSelectTag(newValue);
                        onTagSuggestion("");
                        onMentionSuggestion("");
                    } else if (!newValue.length) {
                        onTagSuggestion("");
                        onMentionSuggestion("");
                    }
                }}
                onSelect={(event) => {
                    // @ts-ignore
                    cursorPos.current = event.target.selectionStart;
                }}
                style={{minHeight: 100}}
                value={value.formattedText}
            />
            {shouldShowSuggestions && (
                <div style={{position: 'relative'}}>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {topicTags.length ? (
                        <Suggestions
                            items={topicTags}
                            onItemPress={(selectedTag) => {
                                insertTag(value.formattedText, selectedTag, "topic");
                            }}
                        />
                    ) : userTags.length ? (
                        <Suggestions
                            items={userTags}
                            onItemPress={(selectedTag) => {
                                console.log({selectedTag})
                                insertTag(value.formattedText, selectedTag, "user");
                            }}
                        />
                    ) : null}
                </div>
            )}
        </>
    );
};

export default RichTextInput;
