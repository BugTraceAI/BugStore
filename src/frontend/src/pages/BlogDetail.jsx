import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/blog/${id}`)
            .then(res => res.json())
            .then(data => {
                setBlog(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching blog detail:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-20 text-center font-sans text-hive-text">Decoding transmission...</div>;
    if (!blog) return <div className="p-20 text-center text-hive-muted">Chronicle not found in the swarm.</div>;

    return (
        <div className="bg-hive-light/20 min-h-screen">
            <div className="container mx-auto p-4 py-20 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center gap-2 text-hive-muted font-black uppercase tracking-widest text-xs mb-12 hover:text-coral transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Chronicles
                </Link>

                <article className="bg-hive-medium/60 backdrop-blur-xl border border-hive-border/40 rounded-3xl shadow-card overflow-hidden">
                    <div className="h-[400px] w-full bg-hive-deep relative">
                        <img
                            src={`https://picsum.photos/seed/${blog.id * 7}/1200/800`}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-10 left-10 right-10">
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter">
                                {blog.title}
                            </h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-16">
                        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-8 border-b border-hive-border/40">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-hive-light/40 rounded-xl flex items-center justify-center">
                                        <User className="w-5 h-5 text-hive-text" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Researcher</div>
                                        <div className="text-hive-text font-bold">Member #{blog.author_id}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-hive-light/40 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-hive-text" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-hive-subtle">Transmission Date</div>
                                        <div className="text-hive-text font-bold">{new Date(blog.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="p-3 bg-hive-light/40 rounded-xl text-hive-muted hover:bg-coral hover:text-white transition-all shadow-sm">
                                    <Bookmark className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-hive-light/40 rounded-xl text-hive-muted hover:bg-coral hover:text-white transition-all shadow-sm">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div
                            className="prose prose-lg max-w-none text-hive-muted font-medium leading-relaxed blog-content"
                            /* V-016: Stored XSS - rendering raw content from DB */
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>
                </article>

                <div className="mt-20 p-12 bg-coral rounded-3xl text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Join the Research</h3>
                        <p className="opacity-70 font-bold italic">Share your colony's growth stories with the hive.</p>
                    </div>
                    <button className="bg-hive-light/40 text-hive-text px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-white transition-all">
                        Write a Chronicle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
