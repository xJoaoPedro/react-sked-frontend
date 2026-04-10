import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PageHeader } from '../components/PageHeader';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../components/ui/table';
import { Plus, Edit, Trash2, User, Upload, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkSchedule {
  [key: string]: {
    manha: { start: string; end: string };
    tarde: { start: string; end: string };
    noite: { start: string; end: string };
  };
}

interface Professional {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  specialty: string;
  status: 'active' | 'inactive';
  schedule?: WorkSchedule;
}

const mockProfessionals: Professional[] = [
  {
    id: 1,
    name: 'Juliana Ferreira',
    email: 'juliana.ferreira@gmail.com',
    phone: '(11) 98765-4321',
    specialty: 'Cabeleireira e Colorista',
    status: 'active',
    schedule: {
      segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    },
  },
  {
    id: 2,
    name: 'Roberto Almeida',
    email: 'roberto.almeida@outlook.com',
    phone: '(21) 97654-3210',
    specialty: 'Barbeiro Profissional',
    status: 'active',
    schedule: {
      segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    },
  },
  {
    id: 3,
    name: 'Mariana Costa',
    email: 'mari.costa@hotmail.com',
    phone: '(31) 96543-2109',
    specialty: 'Manicure e Pedicure',
    status: 'active',
    schedule: {
      segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    },
  },
  {
    id: 4,
    name: 'Thiago Martins',
    email: 'thiago.martins@icloud.com',
    phone: '(41) 95432-1098',
    specialty: 'Massoterapeuta',
    status: 'active',
    schedule: {
      segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    },
  },
  {
    id: 5,
    name: 'Camila Rodrigues',
    email: 'camila.rodrigues@yahoo.com',
    phone: '(51) 94321-0987',
    specialty: 'Esteticista',
    status: 'active',
    schedule: {
      segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    },
  },
];

const weekDays = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    photo: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [schedule, setSchedule] = useState<WorkSchedule>({
    segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScheduleChange = (day: string, period: 'manha' | 'tarde' | 'noite', field: 'start' | 'end', value: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [period]: {
          ...schedule[day][period],
          [field]: value,
        },
      },
    });
  };

  const handleAddProfessional = () => {
    const newProfessional: Professional = {
      id: Math.max(...professionals.map(p => p.id)) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialty: formData.specialty,
      photo: formData.photo,
      status: formData.status,
      schedule: schedule,
    };

    setProfessionals([...professionals, newProfessional]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProfessional = () => {
    if (!editingProfessional) return;

    setProfessionals(
      professionals.map(p =>
        p.id === editingProfessional.id
          ? {
              ...editingProfessional,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              specialty: formData.specialty,
              photo: formData.photo,
              status: formData.status,
              schedule: schedule,
            }
          : p
      )
    );

    setEditingProfessional(null);
    resetForm();
  };

  const handleDeleteProfessional = (id: number) => {
    setProfessionals(professionals.filter(p => p.id !== id));
  };

  const openEditDialog = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      specialty: professional.specialty,
      photo: professional.photo || '',
      status: professional.status,
    });
    setSchedule(
      professional.schedule || {
        segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
        terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
        quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
        quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
        sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
        sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
        domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      photo: '',
      status: 'active',
    });
    setSchedule({
      segunda: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      terca: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quarta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      quinta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sexta: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      sabado: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
      domingo: { manha: { start: '09:00', end: '12:00' }, tarde: { start: '14:00', end: '18:00' }, noite: { start: '19:00', end: '22:00' } },
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <PageHeader
        title="Profissionais"
        subtitle="Gerencie os profissionais do seu negócio"
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        {/* Professionals Table */}
        <Card className="overflow-hidden m-6 gap-0">
          <div className="py-3 px-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Profissionais</h3>
                <p className="text-sm text-muted-foreground">
                  {professionals.length} profissionais cadastrados
                </p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar profissional
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1400px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Profissional</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Photo and Basic Info */}
                    <div className="flex gap-6">
                      {/* Photo Upload */}
                      <div className="flex-shrink-0">
                        <Label
                          htmlFor="photo-upload"
                          className="cursor-pointer block"
                        >
                          <div className="w-48 h-64 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-primary rounded-lg">
                            {formData.photo ? (
                              <img
                                src={formData.photo}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-12 h-12 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Clique para carregar foto</span>
                              </div>
                            )}
                          </div>
                        </Label>
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Basic Info - 2x2 Grid */}
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome completo</Label>
                          <Input
                            id="name"
                            placeholder="Ex: João Silva"
                            value={formData.name}
                            onChange={e =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="joao@exemplo.com"
                            value={formData.email}
                            onChange={e =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="specialty">Especialidade</Label>
                          <Input
                            id="specialty"
                            placeholder="Ex: Cabeleireiro"
                            value={formData.specialty}
                            onChange={e =>
                              setFormData({ ...formData, specialty: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={e =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Agenda</h3>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableHead className="w-[140px]">Dia</TableHead>
                              <TableHead>Manhã</TableHead>
                              <TableHead>Tarde</TableHead>
                              <TableHead>Noite</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {weekDays.map(day => (
                              <TableRow key={day.key}>
                                <TableCell className="font-medium">{day.label}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={schedule[day.key]?.manha?.start || '09:00'}
                                      onChange={e =>
                                        handleScheduleChange(day.key, 'manha', 'start', e.target.value)
                                      }
                                      className="w-28"
                                    />
                                    <span className="text-xs text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={schedule[day.key]?.manha?.end || '12:00'}
                                      onChange={e =>
                                        handleScheduleChange(day.key, 'manha', 'end', e.target.value)
                                      }
                                      className="w-28"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={schedule[day.key]?.tarde?.start || '14:00'}
                                      onChange={e =>
                                        handleScheduleChange(day.key, 'tarde', 'start', e.target.value)
                                      }
                                      className="w-28"
                                    />
                                    <span className="text-xs text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={schedule[day.key]?.tarde?.end || '18:00'}
                                      onChange={e =>
                                        handleScheduleChange(day.key, 'tarde', 'end', e.target.value)
                                      }
                                      className="w-28"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={schedule[day.key]?.noite?.start || '19:00'}
                                      onChange={e =>
                                        handleScheduleChange(day.key, 'noite', 'start', e.target.value)
                                      }
                                      className="w-28"
                                    />
                                    <span className="text-xs text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={schedule[day.key]?.noite?.end || '22:00'}
                                      onChange={e =>
                                        handleScheduleChange(day.key, 'noite', 'end', e.target.value)
                                      }
                                      className="w-28"
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleAddProfessional}
                      disabled={!formData.name || !formData.email || !formData.phone}
                    >
                      Adicionar Profissional
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map(professional => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {professional.photo ? (
                            <img
                              src={professional.photo}
                              alt={professional.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{professional.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {professional.specialty}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{professional.email}</TableCell>
                    <TableCell>{professional.phone}</TableCell>
                    <TableCell >
                      <div className="flex gap-2">
                        {/* Edit Dialog */}
                        <Dialog>
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => openEditDialog(professional)}
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-blue-500/10 hover:text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={4} className="bg-blue-500 fill-blue-500">
                              Editar
                            </TooltipContent>
                          </Tooltip>
                          <DialogContent className="sm:max-w-[1400px]">
                            <DialogHeader>
                              <DialogTitle>Editar Profissional</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              {/* Photo and Basic Info */}
                              <div className="flex gap-6">
                                {/* Photo Upload */}
                                <div className="flex-shrink-0">
                                  <Label
                                    htmlFor="edit-photo-upload"
                                    className="cursor-pointer block"
                                  >
                                    <div className="w-48 h-64 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-primary rounded-lg">
                                      {formData.photo ? (
                                        <img
                                          src={formData.photo}
                                          alt="Preview"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex flex-col items-center gap-2">
                                          <Upload className="w-12 h-12 text-muted-foreground" />
                                          <span className="text-sm text-muted-foreground">Clique para carregar foto</span>
                                        </div>
                                      )}
                                    </div>
                                  </Label>
                                  <Input
                                    id="edit-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                  />
                                </div>

                                {/* Basic Info - 2x2 Grid */}
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nome completo</Label>
                                    <Input
                                      id="edit-name"
                                      value={formData.name}
                                      onChange={e =>
                                        setFormData({
                                          ...formData,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-email">E-mail</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={formData.email}
                                      onChange={e =>
                                        setFormData({
                                          ...formData,
                                          email: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-specialty">Especialidade</Label>
                                    <Input
                                      id="edit-specialty"
                                      value={formData.specialty}
                                      onChange={e =>
                                        setFormData({
                                          ...formData,
                                          specialty: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Telefone</Label>
                                    <Input
                                      id="edit-phone"
                                      value={formData.phone}
                                      onChange={e =>
                                        setFormData({
                                          ...formData,
                                          phone: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Schedule Section */}
                              <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Agenda</h3>
                                <div className="border border-border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="w-[140px]">Dia</TableHead>
                                        <TableHead>Manhã</TableHead>
                                        <TableHead>Tarde</TableHead>
                                        <TableHead>Noite</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {weekDays.map(day => (
                                        <TableRow key={day.key}>
                                          <TableCell className="font-medium">
                                            {day.label}
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="time"
                                                value={schedule[day.key]?.manha?.start || '09:00'}
                                                onChange={e =>
                                                  handleScheduleChange(
                                                    day.key,
                                                    'manha',
                                                    'start',
                                                    e.target.value
                                                  )
                                                }
                                                className="w-28"
                                              />
                                              <span className="text-xs text-muted-foreground">até</span>
                                              <Input
                                                type="time"
                                                value={schedule[day.key]?.manha?.end || '12:00'}
                                                onChange={e =>
                                                  handleScheduleChange(
                                                    day.key,
                                                    'manha',
                                                    'end',
                                                    e.target.value
                                                  )
                                                }
                                                className="w-28"
                                              />
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="time"
                                                value={schedule[day.key]?.tarde?.start || '14:00'}
                                                onChange={e =>
                                                  handleScheduleChange(
                                                    day.key,
                                                    'tarde',
                                                    'start',
                                                    e.target.value
                                                  )
                                                }
                                                className="w-28"
                                              />
                                              <span className="text-xs text-muted-foreground">até</span>
                                              <Input
                                                type="time"
                                                value={schedule[day.key]?.tarde?.end || '18:00'}
                                                onChange={e =>
                                                  handleScheduleChange(
                                                    day.key,
                                                    'tarde',
                                                    'end',
                                                    e.target.value
                                                  )
                                                }
                                                className="w-28"
                                              />
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="time"
                                                value={schedule[day.key]?.noite?.start || '19:00'}
                                                onChange={e =>
                                                  handleScheduleChange(
                                                    day.key,
                                                    'noite',
                                                    'start',
                                                    e.target.value
                                                  )
                                                }
                                                className="w-28"
                                              />
                                              <span className="text-xs text-muted-foreground">até</span>
                                              <Input
                                                type="time"
                                                value={schedule[day.key]?.noite?.end || '22:00'}
                                                onChange={e =>
                                                  handleScheduleChange(
                                                    day.key,
                                                    'noite',
                                                    'end',
                                                    e.target.value
                                                  )
                                                }
                                                className="w-28"
                                              />
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingProfessional(null);
                                  resetForm();
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                className="bg-primary hover:bg-primary/90"
                                onClick={handleEditProfessional}
                              >
                                Salvar Alterações
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Delete Button */}
                        <Tooltip disableHoverableContent>
                          <TooltipTrigger asChild>
                            <div>
                              <Button  
                                size="sm"
                                onClick={() => handleDeleteProfessional(professional.id)}
                                className="h-8 w-8 p-0 rounded rounded-md bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>

                          <TooltipContent side="top" sideOffset={4} className="bg-destructive fill-destructive">
                            Remover
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}