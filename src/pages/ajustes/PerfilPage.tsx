import { useId, useState, useRef } from 'react';
import { useAuth } from '../../auth';
import Badge from '@components/primitives/Badge';
import Button from '@components/primitives/Button';
import Input from '@components/primitives/Input';
import Card from '@components/layout/Card';
import { useToast } from '@components/feedback';
import { useUpdateProfile } from '../../features/profile/hooks/useProfile';
import { useAuthenticatedImage } from '@hooks/useAuthenticatedImage';
import { LuCamera, LuShieldCheck } from 'react-icons/lu';

export default function PerfilPage() {
  const { user } = useAuth();
  const toast = useToast();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  // The selected file only feeds the save handler, never the rendered output,
  // so a ref avoids a pointless re-render on selection.
  const photoRef = useRef<File | null>(null);
  // La foto del backend requiere sesión; el archivo recién elegido se previsualiza
  // como data URL y tiene prioridad.
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const authenticatedPhoto = useAuthenticatedImage(user?.photoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const emailId = useId();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    photoRef.current = file;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // El email no es editable: no puede haber diferencia de email que gatille
    // una confirmación. Solo nombre y foto viajan al backend (ver doSave).
    doSave();
  };

  const doSave = async () => {
    try {
      await updateProfile.mutateAsync({ name, photo: photoRef.current ?? undefined });
      toast.success('Perfil actualizado correctamente');
    } catch {
      toast.error('Error al actualizar el perfil');
    }
  };

  const avatar = photoPreview || authenticatedPhoto || undefined;
  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
      <div className="space-y-6">
        <div>
          <h2 className="text-fg text-lg font-semibold">Mi perfil</h2>
          <p className="text-fg-muted text-sm">Edita tu información personal y foto de perfil.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="elevated">
            <Card.Body>
              {/* Avatar */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Foto de perfil"
                      className="size-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-accent flex size-20 items-center justify-center rounded-full text-2xl font-bold text-white">
                      {initial}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-accent hover:bg-accent-hover absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full text-white shadow-md"
                    title="Cambiar foto"
                  >
                    <LuCamera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-fg text-sm font-medium">{user?.name}</p>
                  <p className="text-fg-muted text-xs">{user?.email}</p>
                  <div className="mt-1 flex gap-1">
                    {user?.roles?.map((role) => (
                      <Badge key={role} variant="info">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label htmlFor={nameId} className="text-fg mb-1.5 block text-sm font-medium">
                    Nombre
                  </label>
                  <Input
                    id={nameId}
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={emailId} className="text-fg mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    readOnly
                    placeholder="tu@email.com"
                  />
                  <p className="text-fg-muted mt-1 text-xs">El email no se puede cambiar.</p>
                </div>

                <div className="bg-surface border-border-base text-fg-muted flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                  <LuShieldCheck size={14} className="text-accent" />
                  {user?.isVerified ? 'Email verificado' : 'Email sin verificar'}
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button type="submit" variant="primary" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Card.Footer>
          </Card>
        </form>
      </div>
    </div>
  );
}
