import {useState} from 'react'
import './App.css'
import RichTextInput from "./rich-text/RichTextInput";
import {TagSuggestion} from "./rich-text/types";

const userSuggestions = {
    aanand: 15,
    arman: 10,
    ankit: 23,
    drashti: 20,
    dhaval: 22,
    pratik: 30,
    nishit: 40,
    nitesh: 33,
    ben: 50,
    yash: 60,
    mayur: 70,
};

const tagSuggestions = {
    test: 10,
    hello: 20,
    insta: 30,
    food: 40,
    travel: 50,
    fun: 60,
};

function App() {
    const [value, setValue] = useState({
        formattedText: '',
        serializedText: '',
        users: {},
        topics: {},
    })


    const [suggestedUsers, setSuggestedUsers] = useState<TagSuggestion[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<TagSuggestion[]>([]);

    return (
        <div className="App">
            <RichTextInput value={value} onChange={setValue}
                           onTagSuggestion={(tag) => {
                               setSuggestedUsers([]);
                               if (!tag) {
                                   setSuggestedTags([]);
                                   return;
                               }
                               setSuggestedTags(
                                   Object.entries(tagSuggestions)
                                       .filter(([k]) => k.toLowerCase().startsWith(tag.toLowerCase()))
                                       .map(([k, v]) => ({
                                           id: `${v}`,
                                           name: k,
                                       }))
                               );
                           }}
                           onMentionSuggestion={(tag) => {
                               setSuggestedTags([]);
                               if (!tag) {
                                   setSuggestedUsers([]);
                                   return;
                               }
                               setSuggestedUsers(
                                   Object.entries(userSuggestions)
                                       .filter(([k]) => k.toLowerCase().startsWith(tag.toLowerCase()))
                                       .map(([k, v]) => ({
                                           id: `${v}`,
                                           name: k,
                                       }))
                               );
                           }}
                           topicTags={suggestedTags}
                           userTags={suggestedUsers}/>
        </div>
    )
}

export default App
