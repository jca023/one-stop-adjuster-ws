import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Video, ExternalLink, LayoutDashboard, Map, Camera, ClipboardCheck, List, Package, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { ModuleVideo } from '../../lib/supabase';

const moduleIcons: Record<string, typeof LayoutDashboard> = {
  'claim-dashboard': LayoutDashboard,
  'map-schedule': Map,
  'photos': Camera,
  'inspection': ClipboardCheck,
  'line-items': List,
  'contents': Package,
  'forms': FileText,
};

export default function AdminModuleVideosPage(): React.JSX.Element {
  const [modules, setModules] = useState<ModuleVideo[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch(): Promise<void> {
      const { data } = await supabase
        .from('module_videos')
        .select('*')
        .order('title');
      if (data) {
        setModules(data);
        const map: Record<string, string> = {};
        for (const m of data) map[m.module_key] = m.video_url || '';
        setUrls(map);
      }
    }
    fetch();
  }, []);

  async function handleSave(): Promise<void> {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      for (const mod of modules) {
        const newUrl = urls[mod.module_key] ?? '';
        if (newUrl !== (mod.video_url || '')) {
          const { error: err } = await supabase
            .from('module_videos')
            .update({ video_url: newUrl, updated_at: new Date().toISOString() })
            .eq('module_key', mod.module_key);
          if (err) throw err;
        }
      }
      const { data } = await supabase.from('module_videos').select('*').order('title');
      if (data) {
        setModules(data);
        const map: Record<string, string> = {};
        for (const m of data) map[m.module_key] = m.video_url || '';
        setUrls(map);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = modules.some((m) => (urls[m.module_key] ?? '') !== (m.video_url || ''));

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                <span className="text-gradient">Feature Videos</span>
              </h1>
              <p className="text-[var(--color-mist)] text-sm">
                Add YouTube video URLs for each feature module on the Mobile App page
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-sm">
              Changes saved successfully.
            </div>
          )}

          <div className="space-y-4">
            {modules.map((mod, i) => {
              const Icon = moduleIcons[mod.module_key] || Video;
              const url = urls[mod.module_key] ?? '';
              return (
                <motion.div
                  key={mod.module_key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="glass rounded-xl p-5 group hover:border-[var(--color-gold)]/30 border border-transparent transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                      <Icon className="w-5 h-5 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{mod.title}</h3>
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-surf)] hover:text-[var(--color-gold)] transition-colors"
                        title="Preview video"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrls({ ...urls, [mod.module_key]: e.target.value })}
                    placeholder="https://youtu.be/..."
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
                  />
                </motion.div>
              );
            })}
          </div>

          {modules.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <Video className="w-12 h-12 text-[var(--color-wave)] mx-auto mb-4" />
              <p className="text-[var(--color-mist)]">Loading modules...</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
