import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, Layers, X } from 'lucide-react';
import { courseService } from '../services/api';
import CourseCard from '../components/CourseCard';

const CATEGORIES = [
  'All',
  'Web Development',
  'Programming',
  'Database',
  'Software Engineering',
  'Algorithms',
  'Data Science & AI',
  'Cyber Security',
];

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const CourseListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'All Levels');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getPublicCourses({
        category: selectedCategory,
        level: selectedLevel,
        search: searchTerm,
      });
      if (data?.courses) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLevel('All Levels');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
          Open Course-ware Catalog
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Approved Technical Courses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Curated learning content created by certified instructors and reviewed by administrators.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course title, topics, keywords or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter & Reset */}
          <div className="flex items-center gap-3">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            {(selectedCategory !== 'All' || selectedLevel !== 'All Levels' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No approved courses found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or reset filters to explore available learning materials.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseListPage;

