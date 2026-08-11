import { motion } from 'framer-motion';
import { EmptyState } from '../components/ui/PageLoader';

const sections = [
  {
    title: 'Bağlı Hesaplar',
    description: 'Instagram, Facebook, LinkedIn, Pinterest ve YouTube hesap bağlantıları burada görünecek.',
  },
  {
    title: 'İçerik Takvimi',
    description: 'Yayın planınızı takip edebileceğiniz içerik takvimi yakında eklenecek.',
  },
  {
    title: 'Taslaklar',
    description: 'Hazırladığınız sosyal medya taslakları bu alanda listelenecek.',
  },
  {
    title: 'Zamanlanmış Gönderiler',
    description: 'Zamanlanmış paylaşımlarınız burada yönetilecek.',
  },
];

export function SocialPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section, index) => (
        <motion.section
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-2xl border border-navy-100 bg-white p-5"
        >
          <h2 className="text-sm font-semibold text-navy-900">{section.title}</h2>
          <div className="mt-4">
            <EmptyState title="Henüz veri yok" description={section.description} />
          </div>
        </motion.section>
      ))}
    </div>
  );
}
