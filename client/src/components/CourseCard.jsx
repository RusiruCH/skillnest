import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Layers,
  Edit3,
  Trash2,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const getCategoryBadgeStyle = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('design') || cat.includes('ui')) {
    return 'bg-orange-50 text-orange-600 border-orange-200';
  }
  if (cat.includes('dev') || cat.includes('prog') || cat.includes('mern')) {
    return 'bg-blue-50 text-blue-600 border-blue-200';
  }
  if (cat.includes('machine') || cat.includes('data') || cat.includes('ai')) {
    return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }
  if (cat.includes('arch') || cat.includes('software')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (cat.includes('manage')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (cat.includes('market')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (cat.includes('cyber') || cat.includes('secur')) {
    return 'bg-violet-50 text-violet-700 border-violet-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const CourseCard = ({
  course,
  isInstructorView = false,
  onEdit,
  onDelete,
  onSubmitReview,
  priceText,
  discountText,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const topicCount = course.structures?.length || 0;
  const authorName =
    course.instructor?.name || course.author || 'L.M.R.C. Bandara';

  // Determine pricing / enrollment display
  const price = priceText || (course.price ? `$${course.price}` : '$50');
  const discount = discountText || (course.discount ? `${course.discount}% off` : '50% off');
  const originalPrice = course.originalPrice ? `$${course.originalPrice}` : '$100';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Thumbnail Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={
            course.thumbnail ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill on top-left of image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border shadow-xs backdrop-blur-md ${getCategoryBadgeStyle(
              course.category
            )}`}
          >
            {course.category}
          </span>
        </div>

        {/* 3-dots Menu button on top-right of image */}
        {isInstructorView && (
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm flex items-center justify-center transition border border-slate-200/60 backdrop-blur-sm"
              title="Course options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in text-xs font-semibold text-slate-700">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/instructor/courses/${course._id}/curriculum`);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-indigo-600"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Curriculum Builder
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/instructor/courses/${course._id}/edit`);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    Edit Details
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/courses/${course._id}`);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    Preview Learner View
                  </button>

                  {course.status === 'draft' && onSubmitReview && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onSubmitReview(course._id);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-amber-50 text-amber-700 flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit for Approval
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(course);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Course
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Status Badge overlay in bottom-right of image if instructor */}
        {isInstructorView && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <StatusBadge status={course.status} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-indigo-600 transition">
            <Link
              to={
                isInstructorView
                  ? `/instructor/courses/${course._id}/curriculum`
                  : `/courses/${course._id}`
              }
            >
              {course.title}
            </Link>
          </h3>

          {/* Author line */}
          <p className="mt-1.5 text-xs text-slate-500 font-medium">
            by <span className="text-slate-700 font-semibold">{authorName}</span>
          </p>
        </div>

        {/* Pricing / Meta & Action row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-rose-500">{discount}</span>
              <span className="text-xs text-slate-400 line-through">
                {originalPrice}
              </span>
              <span className="text-base font-extrabold text-slate-900 ml-1">
                {price}
              </span>
            </div>

            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>{topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}</span>
            </div>
          </div>

          {/* View Details full-width outline button */}
          <Link
            to={
              isInstructorView
                ? `/instructor/courses/${course._id}/curriculum`
                : `/courses/${course._id}`
            }
            className="w-full text-center py-2 px-4 rounded-xl text-xs font-bold text-indigo-600 hover:text-white bg-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 shadow-2xs transition-all duration-200"
          >
            {isInstructorView ? 'Manage & Curriculum' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
