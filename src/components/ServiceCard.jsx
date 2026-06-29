import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ServiceCard({ to, icon: Icon, title, description, gradient, accentColor }) {
  return (
    <Link to={to} className="group block">
      <div className={`relative overflow-hidden rounded-2xl p-6 h-full min-h-[200px] ${gradient} text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold font-poppins mb-2">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed mb-4">{description}</p>
          <div className="flex items-center gap-1 text-sm font-medium text-white/90 group-hover:gap-2 transition-all">
            Ver más <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
