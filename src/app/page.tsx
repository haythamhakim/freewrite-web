"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<string>("Lato");
  const [timeRemaining, setTimeRemaining] = useState<number>(900); // 15 minutes
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [editingTimer, setEditingTimer] = useState<boolean>(false);
  const [timerInput, setTimerInput] = useState<string>("15:00");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderText, setPlaceholderText] = useState<string>("");
  const resetTimerRef = useRef<boolean>(false);
  const [lastSetDuration, setLastSetDuration] = useState<number>(900); // Track the last user-set duration
  const [backspaceDisabled, setBackspaceDisabled] = useState<boolean>(false);

  const placeholderOptions = [
    "Begin writing",
    "Pick a thought and go",
    "Start typing",
    "What's on your mind",
    "Just start",
    "Type your first thought",
    "Start with one sentence",
    "Just say it",
  ];

  // Font options
  const fontOptions = [
    { name: "Lato", value: "Lato" },
    { name: "Arial", value: "Arial" },
    { name: "System", value: "system-ui" },
    { name: "Serif", value: "Times New Roman" },
  ];

  // Font size options
  const fontSizeOptions = [16, 18, 20, 22, 24, 26];

  interface Entry {
    id: string;
    date: string;
    content: string;
    previewText: string;
    filename: string;
  }

  // Create a new entry
  const createNewEntry = () => {
    const id = crypto.randomUUID();
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    });
    const dateString = dateFormatter.format(now);

    const isoDate = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `[${id}]-[${isoDate}].md`;

    const newEntry: Entry = {
      id,
      date: dateString,
      content: "",
      previewText: "",
      filename,
    };

    // Add to beginning of entries list
    setEntries((prev) => [newEntry, ...prev]);
    setSelectedEntryId(id);
    setText("");

    // Set random placeholder
    setPlaceholderText(
      placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)]
    );
  };

  // Save current entry to localStorage
  const saveEntry = (entry: Entry) => {
    const updatedEntry = {
      ...entry,
      content: text,
      previewText:
        text.replace(/\n/g, " ").trim().slice(0, 30) +
        (text.length > 30 ? "..." : ""),
    };

    const updatedEntries = entries.map((e) =>
      e.id === updatedEntry.id ? updatedEntry : e
    );

    setEntries(updatedEntries);
    localStorage.setItem("freewrite-entries", JSON.stringify(updatedEntries));
  };

  // Load entries from localStorage
  const loadEntries = () => {
    const savedEntries = localStorage.getItem("freewrite-entries");
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries) as Entry[];
      setEntries(parsed);

      if (parsed.length > 0) {
        setSelectedEntryId(parsed[0].id);
        setText(parsed[0].content);
      } else {
        createNewEntry();
      }
    } else {
      createNewEntry();
    }
  };

  // Load selected entry content
  const loadEntry = (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      setText(entry.content);
      setSelectedEntryId(entryId);
    }
  };

  // Delete entry
  const deleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter((e) => e.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem("freewrite-entries", JSON.stringify(updatedEntries));

    if (selectedEntryId === entryId) {
      if (updatedEntries.length > 0) {
        setSelectedEntryId(updatedEntries[0].id);
        setText(updatedEntries[0].content);
      } else {
        createNewEntry();
      }
    }
  };

  // Share with ChatGPT
  const shareWithChatGPT = () => {
    const aiChatPrompt = `below is my journal entry. wyt? talk through it with me like a friend. don't therpaize me and give me a whole breakdown, don't repeat my thoughts with headings. really take all of this, and tell me back stuff truly as if you're an old homie.
    
    Keep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed.

    do not just go through every single thing i say, and say it back to me. you need to proccess everythikng is say, make connections i don't see it, and deliver it all back to me as a story that makes me feel what you think i wanna feel. thats what the best therapists do.

    ideally, you're style/tone should sound like the user themselves. it's as if the user is hearing their own tone but it should still feel different, because you have different things to say and don't just repeat back they say.

    else, start by saying, "hey, thanks for showing me this. my thoughts:"
        
    my entry:
    ${text}`;

    const encodedText = encodeURIComponent(aiChatPrompt);
    window.open(`https://chat.openai.com/?m=${encodedText}`, "_blank");
  };

  // Share with Claude
  const shareWithClaude = () => {
    const claudePrompt = `Take a look at my journal entry below. I'd like you to analyze it and respond with deep insight that feels personal, not clinical.
    Imagine you're not just a friend, but a mentor who truly gets both my tech background and my psychological patterns. I want you to uncover the deeper meaning and emotional undercurrents behind my scattered thoughts.
    Keep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed.
    Use vivid metaphors and powerful imagery to help me see what I'm really building. Organize your thoughts with meaningful headings that create a narrative journey through my ideas.
    Don't just validate my thoughts - reframe them in a way that shows me what I'm really seeking beneath the surface. Go beyond the product concepts to the emotional core of what I'm trying to solve.
    Be willing to be profound and philosophical without sounding like you're giving therapy. I want someone who can see the patterns I can't see myself and articulate them in a way that feels like an epiphany.
    Start with 'hey, thanks for showing me this. my thoughts:' and then use markdown headings to structure your response.

    Here's my journal entry:
    ${text}`;

    const encodedText = encodeURIComponent(claudePrompt);
    window.open(`https://claude.ai/new?q=${encodedText}`, "_blank");
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Parse time input into seconds
  const parseTimeInput = (input: string): number => {
    const parts = input.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    return 900; // Default to 15 minutes
  };

  // Handle timer input change
  const handleTimerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimerInput(e.target.value);
  };

  // Handle timer input blur
  const handleTimerInputBlur = () => {
    const seconds = parseTimeInput(timerInput);
    setTimeRemaining(seconds);
    setLastSetDuration(seconds); // Save the user-set duration
    setEditingTimer(false);
  };

  // Handle timer input key press
  const handleTimerInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const seconds = parseTimeInput(timerInput);
      setTimeRemaining(seconds);
      setLastSetDuration(seconds); // Save the user-set duration
      setEditingTimer(false);
    } else if (e.key === "Escape") {
      setTimerInput(formatTime(timeRemaining));
      setEditingTimer(false);
    }
  };

  // Timer functionality
  const startTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    // Prevent multiple rapid clicks
    if (resetTimerRef.current) return;
    resetTimerRef.current = true;

    // Reset to the last user-set duration
    setTimeRemaining(lastSetDuration);
    setTimerInput(formatTime(lastSetDuration)); // Update the display too

    // Make sure timer is stopped before starting it again
    setTimerRunning(false);

    // Use setTimeout to ensure state updates before starting timer again
    setTimeout(() => {
      setTimerRunning(true);
      resetTimerRef.current = false;
    }, 100);
  };

  // Load disabled backspace localStorage settings.
  useEffect(() => {
    const stored = localStorage.getItem("freewrite-backspace-disabled");
    if (stored !== null) {
      setBackspaceDisabled(stored === "true");
    }
  }, []);

  // Effect for timer
  useEffect(() => {
    // Initialize interval outside the conditional
    let interval: NodeJS.Timeout | undefined;

    if (timerRunning && timeRemaining > 0) {
      // Make sure controls stay visible when timer is running
      setShowControls(true);

      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerRunning(false);
      setShowControls(true);
    }

    // Clear interval on cleanup
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeRemaining]);

  // Effect to save current entry when text changes
  useEffect(() => {
    if (selectedEntryId) {
      const entry = entries.find((e) => e.id === selectedEntryId);
      if (entry) {
        saveEntry(entry);
      }
    }
  }, [text]);

  // Load entries and settings on initial render
  useEffect(() => {
    loadEntries();

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem("freewrite-sidebar-visible");
    if (savedSidebarState !== null) {
      setShowSidebar(savedSidebarState === "true");
    }

    // Set random placeholder
    setPlaceholderText(
      placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)]
    );

    // Focus textarea
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem("freewrite-sidebar-visible", showSidebar.toString());
  }, [showSidebar]);

  // Calculate line height based on font size
  const lineHeight = fontSize * 1.5;

  // Update timerInput whenever timeRemaining changes
  useEffect(() => {
    if (!editingTimer) {
      setTimerInput(formatTime(timeRemaining));
    }
  }, [timeRemaining, editingTimer]);

  //Saves backspace preferences persistently
  useEffect(() => {
    localStorage.setItem("freewrite-backspace-disabled", backspaceDisabled.toString());
  }, [backspaceDisabled]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-800">
      {/* Sidebar */}
      <div
        className={`w-64 border-r border-gray-200 transition-all duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } absolute h-full bg-white z-10 ${
          showSidebar ? "block" : "hidden md:block md:hidden"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Entries</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={createNewEntry}
              className="p-1 rounded hover:bg-gray-100"
              title="New Entry"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {/* Hide sidebar button (desktop only) */}
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 rounded hover:bg-gray-100 hidden md:block"
              title="Hide sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 border-b border-gray-100 cursor-pointer ${
                selectedEntryId === entry.id
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => loadEntry(entry.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{entry.date}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEntry(entry.id);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Delete entry"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm mt-1 text-gray-600 truncate">
                {entry.previewText || "Empty entry"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Sidebar peek indicator (only visible when sidebar is hidden on desktop) */}
        <div
          className={`absolute left-0 top-20 h-24 w-1 bg-gray-200 cursor-pointer rounded-r hover:w-2 transition-all duration-200 ${
            !showSidebar ? "md:block hidden" : "hidden"
          }`}
          onClick={() => setShowSidebar(true)}
          title="Show entries"
        ></div>

        {/* Editor */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-3xl px-4 pt-16 pb-20 relative">
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full resize-none outline-none bg-white"
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}px`,
                background: "white",
              }}
              placeholder={placeholderText}
              spellCheck={false}
              onKeyDown={(e) => {
                if (backspaceDisabled && e.key === "Backspace") {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        {/* Bottom controls */}
        <div
          className={`border-t border-gray-200 p-3 flex justify-between items-center transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => !timerRunning && setShowControls(false)}
        >
          {/* Font controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="text-sm bg-transparent p-1"
              >
                {fontSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>

              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="text-sm border-0 ring-0 bg-transparent rounded-md p-1"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/*Backspace Controls*/}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm cursor-pointer select-none">
                <div
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    backspaceDisabled ? "bg-black" : "bg-gray-300"
                  }`}
                  onClick={() => setBackspaceDisabled(!backspaceDisabled)}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      backspaceDisabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
                <span>Disable Backspace</span>
              </label>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              {editingTimer ? (
                <input
                  type="text"
                  value={timerInput}
                  onChange={handleTimerInputChange}
                  onBlur={handleTimerInputBlur}
                  onKeyDown={handleTimerInputKeyPress}
                  className="timer-input"
                  autoFocus
                />
              ) : (
                <span
                  className={`text-sm cursor-pointer hover:underline ${
                    timerRunning ? "text-gray-600 font-semibold" : ""
                  }`}
                  onClick={() => !timerRunning && setEditingTimer(true)}
                  title={
                    timerRunning
                      ? "Timer is running"
                      : "Click to edit timer duration"
                  }
                >
                  {formatTime(timeRemaining)}
                </span>
              )}
              {!timerRunning ? (
                <button
                  onClick={startTimer}
                  className="text-gray-500 hover:text-gray-700"
                  title="Start timer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="text-gray-500 hover:text-gray-700"
                  title="Stop timer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={resetTimer}
                className="text-gray-500 hover:text-gray-700"
                title="Reset and start timer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Toggle sidebar button (moved here) */}
            <button
              className="text-gray-500 hover:text-gray-700 p-1"
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? "Hide entries" : "Show entries"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* AI helpers */}
            <div className="flex items-center space-x-2">
              <button
                onClick={shareWithChatGPT}
                className="text-gray-500 hover:text-gray-700"
                title="Share with ChatGPT"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                </svg>
              </button>
              <button
                onClick={shareWithClaude}
                className="text-gray-500 hover:text-gray-700"
                title="Share with Claude"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16c-3.31 0-6-2.69-6-6 0-3.32 2.69-6 6-6 3.31 0 6 2.69 6 6 0 3.31-2.69 6-6 6zm5.91-6c0 2.61-1.67 4.85-4 5.66V15c0-1.1-.9-2-2-2h-2v-2h2c1.1 0 2-.9 2-2V7.33c2.33.81 4 3.05 4 5.67z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
