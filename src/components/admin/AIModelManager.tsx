import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Save, GripVertical, Key, Bot, Shuffle, ArrowUpDown } from 'lucide-react';

interface AIModel {
  id: string;
  model_id: string;
  display_name: string;
  provider: 'lovable' | 'groq';
  is_enabled: boolean;
  priority_order: number;
}

interface GroqApiKey {
  id: string;
  api_key_masked: string;
  api_key_encrypted: string;
  priority_order: number;
  is_enabled: boolean;
}

interface AIConfig {
  models: AIModel[];
  groqApiKeys: GroqApiKey[];
  apiKeySelectionMode: 'ordered' | 'random';
}

const DEFAULT_MODELS: AIModel[] = [
  { id: '1', model_id: 'google/gemini-2.5-flash-lite', display_name: 'Gemini 2.5 Flash Lite (Lovable)', provider: 'lovable', is_enabled: true, priority_order: 1 },
  { id: '2', model_id: 'gpt-oss-120b', display_name: 'GPT OSS 120B', provider: 'groq', is_enabled: true, priority_order: 2 },
  { id: '3', model_id: 'gpt-oss-20b', display_name: 'GPT OSS 20B', provider: 'groq', is_enabled: true, priority_order: 3 },
  { id: '4', model_id: 'kimi-k2', display_name: 'Kimi K2', provider: 'groq', is_enabled: true, priority_order: 4 },
  { id: '5', model_id: 'llama-4-scout-17b-16e-instruct', display_name: 'Llama 4 Scout', provider: 'groq', is_enabled: true, priority_order: 5 },
  { id: '6', model_id: 'llama-3.3-70b-versatile', display_name: 'Llama 3.3 70B', provider: 'groq', is_enabled: true, priority_order: 6 },
];

export const AIModelManager = () => {
  const [config, setConfig] = useState<AIConfig>({
    models: DEFAULT_MODELS,
    groqApiKeys: [],
    apiKeySelectionMode: 'ordered',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const result = await settingsApi.get('ai_config');
      if (result?.value) {
        setConfig({
          ...result.value,
          models: result.value.models || DEFAULT_MODELS,
          groqApiKeys: result.value.groqApiKeys || [],
          apiKeySelectionMode: result.value.apiKeySelectionMode || 'ordered',
        });
      }
    } catch (error: any) {
      console.error('Failed to load AI config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await settingsApi.set('ai_config', config);
      toast.success('AI configuration saved!');
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModel = (modelId: string) => {
    setConfig(prev => ({
      ...prev,
      models: prev.models.map(m =>
        m.model_id === modelId ? { ...m, is_enabled: !m.is_enabled } : m
      ),
    }));
  };

  const moveModel = (index: number, direction: 'up' | 'down') => {
    const newModels = [...config.models];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newModels.length) return;
    
    [newModels[index], newModels[targetIndex]] = [newModels[targetIndex], newModels[index]];
    newModels.forEach((m, i) => m.priority_order = i + 1);
    
    setConfig(prev => ({ ...prev, models: newModels }));
  };

  const addApiKey = () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    const masked = newApiKey.slice(0, 8) + '...' + newApiKey.slice(-4);
    const newKey: GroqApiKey = {
      id: `key-${Date.now()}`,
      api_key_masked: masked,
      api_key_encrypted: newApiKey,
      priority_order: config.groqApiKeys.length + 1,
      is_enabled: true,
    };

    setConfig(prev => ({
      ...prev,
      groqApiKeys: [...prev.groqApiKeys, newKey],
    }));
    setNewApiKey('');
    toast.success('API key added');
  };

  const removeApiKey = (id: string) => {
    setConfig(prev => ({
      ...prev,
      groqApiKeys: prev.groqApiKeys.filter(k => k.id !== id),
    }));
    toast.success('API key removed');
  };

  const toggleApiKey = (id: string) => {
    setConfig(prev => ({
      ...prev,
      groqApiKeys: prev.groqApiKeys.map(k =>
        k.id === id ? { ...k, is_enabled: !k.is_enabled } : k
      ),
    }));
  };

  const moveApiKey = (index: number, direction: 'up' | 'down') => {
    const newKeys = [...config.groqApiKeys];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newKeys.length) return;
    
    [newKeys[index], newKeys[targetIndex]] = [newKeys[targetIndex], newKeys[index]];
    newKeys.forEach((k, i) => k.priority_order = i + 1);
    
    setConfig(prev => ({ ...prev, groqApiKeys: newKeys }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          AI Model Configuration
        </h2>
        <Button onClick={saveConfig} disabled={isSaving} className="gap-2 bg-gradient-gold text-primary-foreground">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      {/* AI Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Models
          </CardTitle>
          <CardDescription>
            Configure which AI models to use and their fallback order. Models will be tried in order until one succeeds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.models.map((model, index) => (
            <div
              key={model.model_id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                model.is_enabled ? 'bg-card border-border' : 'bg-muted/50 border-border/50 opacity-60'
              }`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveModel(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-muted rounded disabled:opacity-30"
                >
                  <ArrowUpDown className="h-3 w-3 rotate-180" />
                </button>
                <button
                  onClick={() => moveModel(index, 'down')}
                  disabled={index === config.models.length - 1}
                  className="p-1 hover:bg-muted rounded disabled:opacity-30"
                >
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </div>

              <div className="flex-1">
                <p className="font-medium text-foreground">{model.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {model.provider === 'lovable' ? 'Lovable AI' : 'Groq'} • {model.model_id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  model.provider === 'lovable' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {model.provider === 'lovable' ? 'Lovable' : 'Groq'}
                </span>
                <Switch
                  checked={model.is_enabled}
                  onCheckedChange={() => toggleModel(model.model_id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Groq API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Groq API Keys
          </CardTitle>
          <CardDescription>
            Add multiple Groq API keys for fallback. Keys will be used based on your selection mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Mode */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <Label className="text-sm font-medium">API Key Selection Mode</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Choose how API keys are selected when making requests
              </p>
            </div>
            <Select
              value={config.apiKeySelectionMode}
              onValueChange={(value: 'ordered' | 'random') => 
                setConfig(prev => ({ ...prev, apiKeySelectionMode: value }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordered">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Ordered
                  </div>
                </SelectItem>
                <SelectItem value="random">
                  <div className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Random
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add New Key */}
          <div className="flex gap-2">
            <Input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter Groq API key..."
              className="flex-1"
            />
            <Button onClick={addApiKey} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Key
            </Button>
          </div>

          {/* API Keys List */}
          {config.groqApiKeys.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No Groq API keys added yet. Groq models will not work without API keys.
            </p>
          ) : (
            <div className="space-y-2">
              {config.groqApiKeys.map((key, index) => (
                <div
                  key={key.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    key.is_enabled ? 'bg-card border-border' : 'bg-muted/50 border-border/50 opacity-60'
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveApiKey(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ArrowUpDown className="h-2.5 w-2.5 rotate-180" />
                    </button>
                    <button
                      onClick={() => moveApiKey(index, 'down')}
                      disabled={index === config.groqApiKeys.length - 1}
                      className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ArrowUpDown className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <code className="text-sm text-foreground">{key.api_key_masked}</code>
                    <p className="text-xs text-muted-foreground">Priority: {index + 1}</p>
                  </div>

                  <Switch
                    checked={key.is_enabled}
                    onCheckedChange={() => toggleApiKey(key.id)}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeApiKey(key.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
