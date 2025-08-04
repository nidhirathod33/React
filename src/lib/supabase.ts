// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// // if (!supabaseUrl || !supabaseAnonKey) {
// //   throw new Error('Missing Supabase environment variables');
// // }

// // export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // Database constants
export const SUBJECTS = [
  { value: "Mathematics", label: "Mathematics", icon: "📘" },
  { value: "Science", label: "Science", icon: "🔬" },
  { value: "English", label: "English", icon: "📖" },
  { value: "Hindi", label: "Hindi", icon: "📚" },
  { value: "Social Studies", label: "Social Studies", icon: "🌍" },
  { value: "Physics", label: "Physics", icon: "⚛️" },
  { value: "Chemistry", label: "Chemistry", icon: "🧪" },
  { value: "Biology", label: "Biology", icon: "🧬" },
  { value: "Computer Science", label: "Computer Science", icon: "💻" },
  { value: "Physical Education", label: "Physical Education", icon: "🏃" },
];

export const STANDARDS = Array.from({ length: 12 }, (_, i) => ({
  value: `${i + 1}`,
  label: `${i + 1}${
    i + 1 === 1 ? "st" : i + 1 === 2 ? "nd" : i + 1 === 3 ? "rd" : "th"
  }`,
}));

export const CLASSES = ["A", "B", "C", "D"].map((cls) => ({
  value: cls,
  label: `Class ${cls}`,
}));

export const LECTURE_TYPES = [
  { value: "Theory", label: "Theory", icon: "📝" },
  { value: "Practical", label: "Practical", icon: "⚙️" },
];
