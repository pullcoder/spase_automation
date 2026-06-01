export default function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-[#050510]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-sm tracking-[0.3em] text-blue-400 uppercase mb-3">
          Contact
        </p>
        <h2 className="text-4xl font-bold text-white mb-4">연락하기</h2>
        <p className="text-white/50 mb-10">
          프로젝트 협업, 질문, 피드백은 언제든 환영합니다.
        </p>

        <form className="flex flex-col gap-4 text-left">
          <input
            type="text"
            placeholder="이름"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <input
            type="email"
            placeholder="이메일"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <textarea
            rows={4}
            placeholder="메시지"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            전송하기
          </button>
        </form>
      </div>
    </section>
  );
}
