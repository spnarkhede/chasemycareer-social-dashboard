// app/dashboard/news/lib/mockNews.ts
import { NewsItem, NewsTopic } from "@/types/news";
import { subHours, subDays, format } from "date-fns";

export function generateMockNews(count = 30): NewsItem[] {
  const topics: NewsTopic[] = ["tools", "research", "business", "hiring", "ai"];
  const sources = [
    { name: "Harvard Business Review", url: "https://hbr.org" },
    { name: "Forbes", url: "https://forbes.com" },
    { name: "TechCrunch", url: "https://techcrunch.com" },
    { name: "LinkedIn News", url: "https://linkedin.com/news" },
    { name: "Fast Company", url: "https://fastcompany.com" },
    { name: "VentureBeat", url: "https://venturebeat.com" },
  ];

  const headlines = [
    {
      topic: "ai" as NewsTopic,
      titles: [
        "AI Resume Screeners Now Used by 75% of Fortune 500 Companies",
        "How ChatGPT is Changing the Job Interview Process",
        "New AI Tool Helps Job Seekers Optimize LinkedIn Profiles in Seconds",
        "Study: AI-Written Cover Letters Get 40% More Responses",
        "The Rise of AI Career Coaches: What Job Seekers Need to Know",
      ],
    },
    {
      topic: "hiring" as NewsTopic,
      titles: [
        "Remote Job Postings Drop 30% But Salaries Increase",
        "Skills-Based Hiring Grows 47% in 2024, Report Finds",
        "Top 10 Most In-Demand Jobs for Q2 2024",
        "Companies Prioritize Soft Skills Over Technical Degrees",
        "Gen Z Job Seekers Demand Transparency in Salary Ranges",
      ],
    },
    {
      topic: "tools" as NewsTopic,
      titles: [
        "5 New Resume Builders That Use AI to Beat ATS Systems",
        "LinkedIn Launches New Feature for Job Application Tracking",
        "Best Career Development Apps of 2024",
        "New Platform Connects Job Seekers Directly with Hiring Managers",
        "Free Tool Helps You Negotiate Salary Using Market Data",
      ],
    },
    {
      topic: "research" as NewsTopic,
      titles: [
        "Study: Job Seekers Who Follow Up Within 24hrs Get 3x More Interviews",
        "Psychology of Resume Colors: What Recruiters Really Notice",
        "Research Shows Networking Accounts for 85% of Job Placements",
        "The Science Behind Successful Career Transitions",
        "New Study Reveals Best Days to Submit Job Applications",
      ],
    },
    {
      topic: "business" as NewsTopic,
      titles: [
        "Tech Layoffs Continue: What It Means for Job Seekers",
        "Startups Hiring Aggressively in These 5 Sectors",
        "Economic Outlook: Job Market Predictions for Next Quarter",
        "Companies Shift Budget from Hiring to Retention",
        "Gig Economy Growth: 40% of Workers Now Freelance",
      ],
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const topicGroup = headlines[i % headlines.length];
    const topic = topicGroup.topic;
    const source = sources[i % sources.length];
    const hoursAgo = Math.floor(Math.random() * 168); // Last 7 days
    const publishDate = subHours(new Date(), hoursAgo);

    return {
      id: `news-${i}`,
      title: topicGroup.titles[i % topicGroup.titles.length],
      summary: `This article discusses recent developments in ${topic} that impact job seekers and career professionals. Key insights include market trends, expert recommendations, and actionable takeaways for your career journey.`,
      content: `Full article content would be fetched from the RSS feed or source website. This is a placeholder for the complete article text that users can read by clicking through to the source.`,
      link: `${source.url}/article-${i}`,
      source: source.name,
      sourceUrl: source.url,
      publishDate: publishDate.toISOString(),
      topic,
      imageUrl: `https://picsum.photos/seed/${i}/600/400`,
      author: ["John Smith", "Jane Doe", "Career Expert", "Industry Analyst"][i % 4],
      saved: Math.random() > 0.8,
      read: Math.random() > 0.6,
    };
  }).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

export const TOPIC_OPTIONS: NewsTopic[] = ["all", "tools", "research", "business", "hiring", "ai"];