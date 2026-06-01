const projects = [
  {
    title: "My Universe",
    desc: "3D 우주 시각화 + AI 자동화 홈페이지 (현재 프로젝트)",
    tags: ["Next.js", "Three.js", "Claude AI"],
    href: "#",
  },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] text-green-400 uppercase mb-3">
            Portfolio
          </p>
          <h2 className="text-4xl font-bold text-white">프로젝트</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.href}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <h3 className="font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-white/50 mb-4">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}

          {/* 추가 예정 카드 */}
          <div className="rounded-2xl border border-dashed border-white/20 p-6 flex items-center justify-center text-white/30 text-sm">
            + 프로젝트 추가 예정
          </div>
        </div>
      </div>
    </section>
  );
}
