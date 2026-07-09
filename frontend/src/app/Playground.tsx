import * as React from 'react';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../shared/components/ui/Card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../shared/components/ui/Dialog';
import { useToast } from '../shared/components/ui/Toast';
import { Sun, Moon, Sparkles, Terminal, Layers, Send, AlertTriangle } from 'lucide-react';

export const Playground: React.FC = () => {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    toast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode`, {
      title: 'Theme Updated',
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-background text-primary font-sans transition-colors duration-300 pb-20">
      {/* Premium Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-accent rounded-sm flex items-center justify-center shadow-md shadow-accent/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">SchemaForge UI Bench</h1>
            <p className="text-xs text-secondary">Design System Tokens & Core Component Playground</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={toggleTheme} className="flex items-center gap-2">
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-xs">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-accent" />
                <span className="text-xs">Dark Mode</span>
              </>
            )}
          </Button>
          <a
            href="/"
            className="text-xs text-secondary hover:text-primary transition-colors font-medium border-l border-border-subtle pl-4 h-5 flex items-center"
          >
            Back to App
          </a>
        </div>
      </header>

      {/* Main Grid Bench */}
      <main className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Buttons Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Send className="h-4 w-4 text-accent" />
            Core Buttons
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Verify button variant weights, dimensions, borders, and smooth transitions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Primary Accent</Button>
                <Button variant="secondary">Secondary Surface</Button>
                <Button variant="ghost">Ghost Option</Button>
                <Button variant="destructive">Destructive</Button>
              </div>

              <div className="border-t border-border-subtle/30 pt-4 flex flex-col gap-2">
                <span className="text-xs font-semibold text-secondary">Button Sizes (SM vs MD)</span>
                <div className="flex items-center gap-4">
                  <Button variant="primary" size="sm">Small Variant</Button>
                  <Button variant="primary" size="md">Medium Standard</Button>
                </div>
              </div>

              <div className="border-t border-border-subtle/30 pt-4 flex flex-col gap-2">
                <span className="text-xs font-semibold text-secondary">Disabled States</span>
                <div className="flex items-center gap-4">
                  <Button variant="primary" disabled>Disabled Primary</Button>
                  <Button variant="secondary" disabled>Disabled Secondary</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Inputs Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Terminal className="h-4 w-4 text-accent" />
            Inputs & Fields
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Form Inputs</CardTitle>
              <CardDescription>Styled input fields conforming to the radius: 4px border & accent ring focus states.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-secondary">Standard Text Input</label>
                <Input placeholder="Enter schema workspace slug..." />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-secondary">Pre-populated / Active State</label>
                <Input defaultValue="postgresql://postgres:secure_password@localhost:5432" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-secondary">Disabled Input Field</label>
                <Input disabled placeholder="Cannot edit this block..." />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            Content Cards
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Workspace Schema Table Preview</CardTitle>
              <CardDescription>Displaying relational database columns with custom border-subtle dividers.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Monospaced code list inside card */}
              <div className="divide-y divide-border-subtle/50 font-mono text-xs">
                <div className="px-6 py-3 flex items-center justify-between hover:bg-surface/50">
                  <span className="text-primary font-semibold">id: UUID</span>
                  <span className="text-secondary">PRIMARY KEY, UNIQUE</span>
                </div>
                <div className="px-6 py-3 flex items-center justify-between hover:bg-surface/50">
                  <span className="text-primary font-semibold">workspace_slug: VARCHAR(50)</span>
                  <span className="text-secondary">UNIQUE, NOT NULL</span>
                </div>
                <div className="px-6 py-3 flex items-center justify-between hover:bg-surface/50">
                  <span className="text-primary font-semibold">owner_id: UUID</span>
                  <span className="text-secondary">REFERENCES users(id)</span>
                </div>
                <div className="px-6 py-3 flex items-center justify-between hover:bg-surface/50">
                  <span className="text-primary font-semibold">created_at: TIMESTAMP</span>
                  <span className="text-secondary">DEFAULT CURRENT_TIMESTAMP</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-secondary">Dialect: PostgreSQL 16</span>
              <Button variant="ghost" size="sm">Edit Schema</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Dialogs & Interactive Triggers */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Modals & Overlays
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Interactive Modals</CardTitle>
              <CardDescription> Radix UI dialog overlay with blur backdrops and scale animation transitions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <p className="text-xs text-secondary leading-relaxed">
                  Trigger an overlay to prompt a schema configuration change. The modal fully respects tab index trap constraints and focus restoration behavior.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="primary" className="w-full sm:w-auto self-start">
                      Open Schema Config Modal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure Database Dialect</DialogTitle>
                      <DialogDescription>
                        Select a dialect and set the default properties for visual validation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 my-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-secondary">Schema Name</label>
                        <Input defaultValue="public_api_v1" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-secondary">Schema Description</label>
                        <Input placeholder="Describe the tables and relations..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="primary"
                          onClick={() => {
                            toast('Database dialect successfully updated in local workspace config.', {
                              title: 'Configuration Saved',
                              variant: 'success',
                            });
                          }}
                        >
                          Save Changes
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Toasts & Notifications */}
        <section className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            Global Toast Notifications
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Trigger Toasts</CardTitle>
              <CardDescription>Verify toast entry queues, icons, border status styling, and auto-dismiss timing.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Button
                variant="secondary"
                className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                onClick={() => {
                  toast('Collaborator invitation has been sent to partner@schemaforge.dev.', {
                    title: 'Invitation Sent',
                    variant: 'success',
                  });
                }}
              >
                Trigger Success Toast
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  toast('Could not establish connection to the remote PostgreSQL instance. Please verify credentials.', {
                    title: 'Database Connection Error',
                    variant: 'danger',
                  });
                }}
              >
                Trigger Danger Toast
              </Button>
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  );
};
