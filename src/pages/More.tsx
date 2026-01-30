import { motion } from 'framer-motion';
import { Award, Users, Activity, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

/* 🔁 MASTER TOGGLE */
const ENABLE_EXTERNAL_LINKS = false; // set to true to re-enable

const highlights = [
  {
    icon: Award,
    title: 'Academic Excellence',
    description: 'Nurturing young minds with quality education and holistic development.',
  },
  {
    icon: Users,
    title: 'House System',
    description: 'Building teamwork and healthy competition through our vibrant house system.',
  },
  {
    icon: Activity,
    title: 'Co-Curricular Activities',
    description: 'Comprehensive CCA programs to develop well-rounded personalities.',
  },
  {
    icon: Calendar,
    title: 'Kalotsav',
    description: 'Our annual arts festival celebrating creativity and cultural heritage.',
  },
];

const exploreItems = [
  { title: 'Results', description: 'View competition results', icon: Award },
  { title: 'Houses', description: 'Our house system', icon: Users },
  { title: 'CCA', description: 'Co-curricular activities', icon: Activity },
  { title: 'Kalotsav', description: 'Arts festival', icon: Calendar },
];

const More = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <section className="bg-background px-4 py-12 pt-24">
        <div className="container mx-auto max-w-7xl">

          {/* Back Button */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* What Makes Us Special */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="text-gradient-gold">What Makes Us</span>{' '}
              <span className="text-foreground">Special</span>
            </h2>
          </motion.div>

          {/* Highlights */}
          <div className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="glass-card h-full rounded-xl border border-border/50 p-6 transition-all duration-300 hover:border-primary/50">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary/30">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore Our School */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-bold md:text-5xl">
              <span className="text-foreground">Explore Our</span>{' '}
              <span className="text-gradient-gold">School</span>
            </h2>
          </motion.div>

          {/* Disabled External Cards */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {exploreItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={ENABLE_EXTERNAL_LINKS ? { scale: 1.02 } : {}}
                onClick={() => {
                  if (ENABLE_EXTERNAL_LINKS) {
                    window.open(
                      'https://mescampusschool.gt.tc',
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }
                }}
                className={`group ${
                  ENABLE_EXTERNAL_LINKS
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-70'
                }`}
              >
                <div className="glass-card h-full rounded-xl border border-border/50 p-6 text-center transition-all duration-300 hover:border-primary/50 md:p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 transition-colors group-hover:bg-primary/30 md:h-16 md:w-16">
                    <item.icon className="h-6 w-6 text-primary md:h-8 md:w-8" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground md:text-xl">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card mt-24 rounded-2xl border border-border/50 p-8 md:p-12"
          >
            <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
              About <span className="text-gradient-gold">MES Campus School</span>
            </h2>

            <div className="mx-auto max-w-4xl space-y-4 text-center leading-relaxed text-muted-foreground">
              <p>
                MES Campus School, Kuttippuram is a premier educational institution
                under the Muslim Educational Society, committed to providing
                quality education that combines academic excellence with character
                building.
              </p>
              <p>
                With a focus on holistic development, we offer a comprehensive
                curriculum complemented by co-curricular activities, sports, and
                cultural programs.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-card/50 p-6 text-center">
                <h3 className="mb-2 text-xl font-bold text-primary">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  Moulding an ideal generation with academic excellence and strong values.
                </p>
              </div>
              <div className="rounded-xl bg-card/50 p-6 text-center">
                <h3 className="mb-2 text-xl font-bold text-primary">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  To inspire students to achieve their full potential as lifelong learners.
                </p>
              </div>
              <div className="rounded-xl bg-card/50 p-6 text-center">
                <h3 className="mb-2 text-xl font-bold text-primary">Our Values</h3>
                <p className="text-sm text-muted-foreground">
                  Excellence, integrity, respect, responsibility, and growth.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default More;
