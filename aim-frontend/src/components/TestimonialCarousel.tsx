import React, { useRef, useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
 id: string;
 company: string;
 quote: string;
 author: string;
 title: string;
}

const testimonials: Testimonial[] = [
 {
 id: "1",
 company: "Morgan Stanley",
 quote:
 "The agent identity and access governance platform gave our wealth management teams zero-trust confidence when deploying autonomous workflows, securely managing machine identities at scale.",
 author: "Elena Rostova",
 title: "Global Head of Enterprise AI & Infrastructure",
 },
 {
 id: "2",
 company: "Pfizer",
 quote:
 "With AIM's zero-trust framework, our R&D document summarizers operate under strict HIPAA API key security policies without compromising processing speed.",
 author: "Dr. Marcus Vance",
 title: "VP of Digital Innovation & Bio-Analytics",
 },
 {
 id: "3",
 company: "AT&T",
 quote:
 "Automating network line diagnostics with agentic workflows reduced dispatch latency by 74% while completely preventing unauthorized tool execution across our subnets.",
 author: "David Sterling",
 title: "Chief Automation Architect",
 },
 {
 id: "4",
 company: "Citigroup",
 quote:
 "Real-time scope evaluation and automated credential rotation enabled our engineering teams to launch compliant agent applications in days instead of months.",
 author: "Sarah Jenkins",
 title: "Director of Cyber Identity & Governance",
 },
 {
 id: "5",
 company: "Roche",
 quote:
 "Automating credential rotation and scope enforcement allowed our R&D teams to safely deploy over 50 autonomous agents across 14 international units while maintaining strict compliance.",
 author: "Karl Weber",
 title: "Lead Enterprise Architect",
 },
];

export const TestimonialCarousel: React.FC = () => {
 const scrollRef = useRef<HTMLDivElement>(null);
 const [isHovered, setIsHovered] = useState(false);

 useEffect(() => {
   let animationId: number;
   const scrollNode = scrollRef.current;

   const step = () => {
     if (scrollNode && !isHovered) {
       scrollNode.scrollLeft += 1.5;
       // Seamless infinite loop by resetting scroll position halfway through (since array is duplicated)
       if (scrollNode.scrollLeft >= scrollNode.scrollWidth / 2) {
         scrollNode.scrollLeft = 0;
       }
     }
     animationId = requestAnimationFrame(step);
   };

   animationId = requestAnimationFrame(step);
   return () => cancelAnimationFrame(animationId);
 }, [isHovered]);

 // Duplicate array for infinite scroll
 const displayItems = [...testimonials, ...testimonials];

 return (
 <section className="bg-white py-24 px-4 md:px-8 border-b border-slate-100 font-sans overflow-hidden">
 <div className="max-w-6xl mx-auto space-y-12">
 
 {/* Top Section */}
 <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
 <div>
 <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
 Customer testimonials
 </h2>
 <p className="text-base text-slate-600 mt-2 font-normal">
 Discover how organizations deliver AI value.
 </p>
 </div>
 </div>

 {/* Carousel Track */}
 <div
 ref={scrollRef}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 onTouchStart={() => setIsHovered(true)}
 onTouchEnd={() => setIsHovered(false)}
 className="flex overflow-x-auto gap-8 scrollbar-none pb-6 select-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
 >
 {displayItems.map((item, idx) => (
 <motion.div
 key={`${item.id}-${idx}`}
 initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: (idx % testimonials.length) * 0.1 }}
 className="min-w-[320px] sm:min-w-[380px] max-w-[420px] flex-shrink-0 flex flex-col justify-between py-6 px-4 border-r border-slate-100 last:border-r-0 hover:bg-slate-50 transition-colors rounded-xl cursor-pointer"
 >
 <div>
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
 {item.company}
 </h3>
 <Quote className="w-6 h-6 text-slate-200 fill-slate-100" />
 </div>

 <blockquote className="text-base text-slate-600 leading-relaxed font-normal my-6">
 &ldquo;{item.quote}&rdquo;
 </blockquote>
 </div>

 <div className="pt-4 border-t border-slate-100">
 <div className="text-sm font-semibold text-slate-900">{item.author}</div>
 <div className="text-xs text-slate-500 mt-0.5">{item.title}</div>
 </div>
 </motion.div>
 ))}
 </div>

 </div>
 </section>
 );
};

export default TestimonialCarousel;
