'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Filter, TrendingUp } from 'lucide-react'

interface SearchSuggestion {
  id: string
  text: string
  category: string
  trending?: boolean
}

interface SearchBarProps {
  placeholder?: string
  suggestions?: SearchSuggestion[]
  onSearch?: (query: string) => void
  onFilter?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'floating'
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  suggestions = [],
  onSearch,
  onFilter,
  className = "",
  variant = 'default'
}) => {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const baseClasses = {
    default: "w-full max-w-2xl",
    compact: "w-full max-w-md",
    floating: "fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 px-4"
  }

  useEffect(() => {
    if (query.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions(suggestions.slice(0, 5))
      setShowSuggestions(false)
    }
  }, [query, suggestions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query
    if (searchTerm.trim()) {
      onSearch?.(searchTerm.trim())
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    handleSearch(suggestion.text)
  }

  const clearSearch = () => {
    setQuery("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative ${baseClasses[variant]} ${className}`}>
      {/* Search Input Container */}
      <div className={`
        relative flex items-center bg-white/80 backdrop-blur-md border rounded-2xl
        transition-all duration-300 ease-out group
        ${isFocused 
          ? 'border-pink-400 shadow-xl shadow-pink-500/20 bg-white/90' 
          : 'border-gray-200 hover:border-pink-300 shadow-lg'
        }
        ${variant === 'floating' ? 'shadow-2xl' : ''}
      `}>
        {/* Search Icon */}
        <div className="pl-4 pr-2">
          <Search className={`
            w-5 h-5 transition-colors duration-200
            ${isFocused ? 'text-pink-500' : 'text-gray-400 group-hover:text-pink-400'}
          `} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true)
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder={placeholder}
          className="
            flex-1 py-3 pr-2 bg-transparent outline-none
            text-gray-800 placeholder-gray-400
            text-sm md:text-base
          "
        />

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pr-2">
          {query && (
            <button
              onClick={clearSearch}
              className="
                p-1 rounded-full hover:bg-gray-100 
                transition-colors duration-200
                opacity-60 hover:opacity-100
              "
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          {onFilter && (
            <button
              onClick={onFilter}
              className="
                p-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600
                text-white hover:from-pink-600 hover:to-purple-700
                transition-all duration-200 transform hover:scale-105
                shadow-lg hover:shadow-xl
              "
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="
          absolute top-full left-0 right-0 mt-2 
          bg-white/95 backdrop-blur-md border border-gray-200 
          rounded-2xl shadow-xl overflow-hidden z-10
          animate-in slide-in-from-top-2 duration-200
        ">
          {filteredSuggestions.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="
                    w-full px-4 py-3 text-left hover:bg-pink-50
                    transition-colors duration-150 border-b border-gray-100 last:border-b-0
                    flex items-center justify-between group
                  "
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-pink-500" />
                    <div>
                      <span className="text-gray-800 text-sm">
                        {suggestion.text}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        in {suggestion.category}
                      </span>
                    </div>
                  </div>
                  
                  {suggestion.trending && (
                    <div className="flex items-center text-xs text-orange-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBar 