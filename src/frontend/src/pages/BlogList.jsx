import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Calendar, ArrowRight, Rss } from 'lucide-react';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blog/')
            .then(res => res.json())
            .then(data => {
                setBlogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching blogs:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-20 text-center font-sans text-hive-text">Scanning colony transmissions...</div>;

    return (
        <div className="container mx-auto p-4 py-20 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-hive-muted font-black uppercase tracking-[0.3em] text-sm">
                        <Rss className="w-5 h-5" /> The Commmunity Hive
                    </div>
                    <h1 className="text-6xl font-black text-hive-text uppercase tracking-tighter leading-none">
                        Specimen <br /> Chronicles
                    </h1>
                </div>
                <p className="max-w-md text-hive-muted font-medium italic border-l-4 border-hive-border/40 pl-6">
                    Latest updates from our field researchers and colony architects. Learn best practices for maintaining your bug ecosystem.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {blogs.length === 0 ? (
                    <div className="col-span-full bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 p-20 rounded-3xl text-center">
                        <p className="text-hive-subtle font-bold">The chronicles are empty. No transmissions found.</p>
                    </div>
                ) : (
                    blogs.map(blog => (
                        <article key={blog.id} className="bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 rounded-3xl overflow-hidden shadow-card group hover:shadow-xl transition-all hover:-translate-y-2 flex flex-col">
                            <div className="h-48 bg-hive-deep overflow-hidden relative">
                                <div className="absolute top-4 left-4 bg-hive-medium/90 backdrop-blur px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-hive-text shadow-sm z-10">
                                    Update #{blog.id}
                                </div>
                                <img
                                    src={`https://picsum.photos/seed/${blog.id * 7}/600/400`}
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-all group-hover:scale-110 duration-700"
                                />
                            </div>

                            <div className="p-8 flex flex-col grow">
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-hive-subtle mb-4">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(blog.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> Member #{blog.author_id}</span>
                                </div>

                                <h2 className="text-2xl font-black text-hive-text mb-4 leading-tight group-hover:text-coral transition-colors">
                                    {blog.title}
                                </h2>

                                <p className="text-hive-subtle line-clamp-3 mb-8 grow font-medium leading-relaxed">
                                    {/* We don't render HTML here for list view to simplify, detail view will have XSS */}
                                    {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                </p>

                                <Link
                                    to={`/blog/${blog.id}`}
                                    className="inline-flex items-center gap-2 text-coral font-black uppercase tracking-widest text-xs group/link"
                                >
                                    Read Chronicle <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
};

export default BlogList;
