# Scout Design Engineer Assessment: Interactive Search Interface

Welcome to the Scout Design Engineer take-home assessment! You'll be building an interactive search and filtering interface from scratch that showcases both your technical skills and design sensibilities.

**We suggest spending up to 2 hours on this take-home assessment, but you may spend as long as you'd like.**

## ‼️‼️‼️ A quick note ‼️‼️‼️

Look, I know that if you put this brief into Cursor it comes up with something that's pretty decent.
I did it myself and it took 2 minutes to get something that fills the requirements.
Honestly, that's great! If you do that as a starting point, that's really great -- it's something we encourage at Scout, and it's how we build a lot of product.

But, again, I did it myself. We're looking for exceptional design engineers; engineers who can do things that we can't do unless we spend an inordinate amount of time on it, because they've honed their craft.

**The best thing you can do to move forward in this process is to amaze us.** Spend the 2 hours focusing on showing me the one thing you are exceptional at. Whether it's design, micro-interactions, UX -- whatever it is, I'm looking to be awed by _something_, so please focus on that!

-Noah

## 🎯 Objective

Create a buttery-smooth, interactive search component that demonstrates your ability to create delightful, beautiful, and intuitive frontend experiences.

## 🚀 Getting Started

1. **Clone this repository** and delete the .git folder
2. **Create a new private repository** in your GitHub account
3. **Create a local repository inside the cloned folder** with `git init`
4. **Install dependencies**: `npm install`
5. **Start the development server**: `npm run dev`
6. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## 📋 What's Already Built

- ✅ **Complete backend API** at `/api/search` with realistic data and search logic
- ✅ **TypeScript interfaces** for type safety (`/src/types/index.ts`)
- ✅ **Project structure** with Next.js 14, TypeScript, Tailwind CSS
- ✅ **Dependencies**: Framer Motion, Lucide React icons, React Query (you can add whatever dependencies you'd like to use)

## 🎨 What You Need to Build

Design and implement a complete search bar component with the following features:

- **Search bar** with real-time search
- **Filters** with categories, tags, price range, and sorting options
- **Results grid** displaying search results with smooth animations

Note: This should be a component that might live in a bigger page, so think about:
- How do you ensure that as much information as possible is visible to the user without it being overwhelming?
- How do you ensure the user can perform actions in as few clicks as possible?
- What tradeoffs do you have to make between the two of these?

## 🔧 Backend API Reference

The search API is already implemented at `/api/search`. Here's how to use it:

### GET `/api/search`

**Query Parameters:**
- `query` - Search term
- `category` - Filter by category
- `tags` - Comma-separated list of tags
- `sortBy` - One of: `relevance`, `price-asc`, `price-desc`, `rating`, `newest`
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `featured` - Filter for featured items (`true`/`false`)

**Example:**
```javascript
const response = await fetch('/api/search?query=headphones&category=Electronics&sortBy=price-asc');
const data = await response.json();
```

**Response Format:**
```typescript
{
  items: SearchItem[];           // Array of search results
  total: number;                 // Total number of results
  suggestions: string[];         // Search suggestions for autocomplete
  facets: {                     // Available filter options
    categories: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}
```

## 📤 Submission

1. **Push your changes** to your private repository
2. **Deploy** your solution (Vercel, Netlify, etc.)
3. **Email us** with:
   - Link to your GitHub repository (make sure to invite `@nfichter` as a collaborator)
   - Link to your deployed demo
   - One thing you think your implementation is top 1% quality in
   - Brief notes about your implementation choices and any trade-offs you made

## 🎯 Evaluation Criteria

We'll be looking at:

- **User Experience** (40%) - How much information is conveyed at once - too little, or does it feel overwhelming? How many clicks does it take to perform an action?
- **Design & Polish** (40%) - Visual design, animations, responsive behavior, micro-interactions
- **Technical Implementation** (10%) - Proper API integration, state management, performance
- **Code Quality** (10%) - Clean, readable, well-structured code with proper TypeScript usage

---

**Good luck!** We're excited to see your implementation. Focus on creating something you'd be proud to show off - this is your chance to demonstrate what makes you an exceptional design engineer.

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks (React Query available if needed)
- **API**: Next.js API Routes
