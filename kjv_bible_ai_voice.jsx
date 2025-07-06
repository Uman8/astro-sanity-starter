import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Search, Moon, BookOpen } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function BibleSearchApp() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('bookmarks')) || []);
  const [darkMode, setDarkMode] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const fetchResults = async (searchTerm) => {
    const response = await fetch(`https://bible-api.com/${searchTerm}?translation=kjv`);
    const data = await response.json();
    if (data && data.verses) {
      setResults(data.verses);
    } else {
      setResults([]);
    }
  };

  const handleSearch = () => {
    fetchResults(query);
  };

  const handleVoiceSearch = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };

  const handleTranscriptSearch = () => {
    setQuery(transcript);
    fetchResults(transcript);
  };

  const toggleBookmark = (verse) => {
    const isBookmarked = bookmarks.some(v => v.book_name === verse.book_name && v.chapter === verse.chapter && v.verse === verse.verse);
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(v => v.book_name !== verse.book_name || v.chapter !== verse.chapter || v.verse !== verse.verse));
    } else {
      setBookmarks([...bookmarks, verse]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  return (
    <div className={`p-6 max-w-3xl mx-auto min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">KJV Bible AI Search</h1>
        <Button onClick={toggleDarkMode} variant="outline">
          <Moon className="mr-2" /> {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Bible verse or topic..."
        />
        <Button onClick={handleSearch}>
          <Search className="mr-2" /> Search
        </Button>
        <Button onClick={handleVoiceSearch} variant="outline">
          <Mic className="mr-2" /> {listening ? 'Listening...' : 'Voice Search'}
        </Button>
      </div>
      {transcript && (
        <div className="mb-4">
          <p className="text-sm">Transcript: {transcript}</p>
          <Button onClick={handleTranscriptSearch} size="sm">Search Transcript</Button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Search Results</h2>
        <div className="grid gap-4">
          {results.map((verse, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{verse.book_name} {verse.chapter}:{verse.verse}</p>
                    <p>{verse.text}</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => speakText(verse.text)}>🔊</Button>
                    <Button size="sm" onClick={() => toggleBookmark(verse)}>
                      {bookmarks.some(v => v.book_name === verse.book_name && v.chapter === verse.chapter && v.verse === verse.verse) ? '★' : '☆'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Bookmarked Verses</h2>
        {bookmarks.length === 0 ? <p>No bookmarks yet.</p> : (
          <div className="grid gap-4">
            {bookmarks.map((verse, index) => (
              <Card key={index}>
                <CardContent>
                  <p className="font-semibold">{verse.book_name} {verse.chapter}:{verse.verse}</p>
                  <p>{verse.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
