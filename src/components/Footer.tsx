import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Facebook, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = {
  produit: [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Pour les clients', href: '#clients' },
    { name: 'Pour les coiffeurs', href: '#barbers' },
    { name: 'Pour les salons', href: '#salons' },
  ],
  entreprise: [
    { name: 'À propos', href: '#' },
    { name: 'Carrières', href: '#' },
    { name: 'Presse', href: '#' },
    { name: 'Investisseurs', href: '#investors' },
  ],
  support: [
    { name: 'Centre d\'aide', href: 'https://www.oundir.tech' },
    { name: 'Contact', href: 'https://www.oundir.tech' },
    { name: 'CGU', href: '#' },
    { name: 'Confidentialité', href: '#' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'Facebook', icon: Facebook, href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative bg-dark-surface border-t border-gold/10">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <motion.a
              href="#hero"
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src="/images/logo.png"
                alt="Coifly Logo"
                className="h-10 w-auto object-contain"
              />
            </motion.a>
            
            <p className="text-text-secondary text-sm mb-6 max-w-xs">
              La plateforme intelligente qui révolutionne la réservation coiffure au Maroc et en Afrique.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <span>contact@coifly.ma</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span>+212 5XX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Beni Mellal, Maroc</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4 capitalize">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-gold transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-text-muted text-sm text-center sm:text-left">
              © {new Date().getFullYear()} Coifly. Tous droits réservés.
              <span className="mx-2">·</span>
              Fondé par{' '}
              <a
                href="https://www.oundir.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 transition-colors cursor-pointer"
              >
                Mohamed Oundir
              </a>
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-dark-surface-light flex items-center justify-center text-text-secondary hover:text-gold hover:bg-gold/10 transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
