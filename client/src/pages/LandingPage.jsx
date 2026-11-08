import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
  FileCode2,
  FileText,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { courseService } from '../services/api';
import CourseCard from '../components/CourseCard';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await courseService.getPublicCourses({ limit: 3 });
        if (data.courses) {
          setCourses(data.courses.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const CATEGORIES = [
    'Web Development',
    'Programming',
    'Database',
    'Software Engineering',
    'Algorithms',
    'Data Science & AI',
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-transparent pt-16 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                South Eastern University of Sri Lanka • CA1 Project
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Master Technical Skills with Structured{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Open Course-ware
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                SkillNest unites modular courses, interactive code playgrounds, hackathons, and
                academic discussions in a single unified MERN ecosystem.
              </p>

              {/* Module 1 Highlight Card */}
              <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 mt-0.5">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <div className="font-bold text-slate-900">
                    Module 1: Course & Learning Material Management
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Developed by <span className="font-semibold text-slate-700">L.M.R.C.Bandara (SEU/IS/22/ICT/113)</span>.
                    Provides course creation, syllabus structure organizing, multi-format materials (video, notes, code, documents), and approval workflows.
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/courses"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Explore Approved Courses
                </Link>
                <Link
                  to="/instructor/dashboard"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-2 transition"
                >
                  Instructor Studio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Hero Graphic / Feature Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Course Hierarchy Matrix
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    MERN Stack
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Course Entity</div>
                        <div className="text-[11px] text-slate-500">Metadata, Instructor, Status</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>

                  <div className="ml-4 pl-4 border-l-2 border-indigo-200 space-y-3">
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold">
                          1.1
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">Course Structures (Topics)</div>
                          <div className="text-[11px] text-slate-500">Sequential syllabus chapters</div>
                        </div>
                      </div>
                      <Layers className="w-4 h-4 text-indigo-500" />
                    </div>

                    <div className="ml-4 pl-4 border-l-2 border-indigo-200 space-y-2">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-slate-700 font-medium">Video Stream Lectures</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-slate-700 font-medium">Markdown Lecture Notes</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center gap-2">
                        <FileCode2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-slate-700 font-medium">Code Snippets & Solutions</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 text-center font-mono">
                  Schema: Course → CourseStructure → LearningMaterial
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Curriculum Showcase
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Approved Courses
            </h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-2xl space-y-3 mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Explore Academic Disciplines
            </h3>
            <p className="text-slate-400 text-sm">
              Filter course materials across core computer science and software development domains.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/courses?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-sm font-medium transition duration-200 border border-slate-700/60"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Group B Project Attribution Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-200 text-slate-500 text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800">SkillNest Project</span> • Group B (SWT22022 Practical for Internet Application Development)
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Member 01: L.M.R.C.Bandara (SEU/IS/22/ICT/113)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

