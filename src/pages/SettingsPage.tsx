import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Building2, CreditCard, Upload, Save, Mail, Phone, Globe, DollarSign, Check, Baby, Wifi, Car, Puzzle, Accessibility, PawPrint, } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingPage } from "./LoadingPage";
import { formatPhone } from "@/lib/parsers";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useLayoutOutletContext } from "@/hooks/useLayoutOutletContext";


export function SettingsPage() {
  const { dados, updateDados } = useLayoutOutletContext();
  const [data, setDataState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  usePageHeader("Configurações Gerais", "Personalize e configure seu sistema de agendamento" );

  useEffect(() => {
    if (!dados) return;

    setDataState(dados.settings);
  }, [dados])

  const   handlePhoneChange = (value: string) => {
    const cleanedPhone = value.replace(/\D/g, "").slice(0, 11);

    setDataState((prev) => ({ ...prev, phone: cleanedPhone }));
  };

  const hasAcceptedPaymentMethod = (method: string) =>
    (data.acceptedPaymentMethods || []).includes(method);

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    setDataState((prev) => {
      const currentMethods = prev.acceptedPaymentMethods || [];

      return {
        ...prev,
        acceptedPaymentMethods: checked
          ? [...new Set([...currentMethods, method])]
          : currentMethods.filter((item) => item !== method),
      };
    });
  };

  const hasAmenity = (amenity: string) =>
    (data.amenities || []).includes(amenity);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setDataState((prev) => {
      const currentAmenities = prev.amenities || [];

      return {
        ...prev,
        amenities: checked
          ? [...new Set([...currentAmenities, amenity])]
          : currentAmenities.filter((item) => item !== amenity),
      };
    });
  };

  const handleSaveData = async () => {
    try {
      setIsSaving(true);

      await api.patch(`/companies/${localStorage.getItem('companyId')}`, data)
      const response = (await api.get(`/companies/${localStorage.getItem('companyId')}/settings`)).data.data
      
      toast.success('Dados da empresa alterados com sucesso!')
      setDataState(response)
      updateDados((prev) => ({
        ...prev,
        settings: response,
      }));
    } finally {
      setIsSaving(false);
    }
  }

  if (data === null) return <LoadingPage />

  const hasPendingChanges =
    JSON.stringify(data) !== JSON.stringify(dados?.settings);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-6 space-y-6">
          {/* Company Profile */}
          <Card className="gap-0">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Perfil da Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    Informações básicas do seu negócio
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex gap-6 mb-6">
                {/* Logo Upload */}
                <div className="flex-shrink-0">
                  <Label htmlFor="logo-upload" className="cursor-pointer block">
                    <div className="w-32 h-32 bg-muted flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors border-2 border-dashed border-border hover:border-primary rounded-lg">
                      {data.photo ? (
                        <img
                          src={data.photo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground text-center px-2">
                            Logo da empresa
                          </span>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    // onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* Company Info */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="company-name">Nome da empresa</Label>
                    <Input
                      id="company-name"
                      value={data.fantasy_name}
                      onChange={(e) =>
                        setDataState((prev) => ({ ...prev, fantasy_name: e.target.value }))
                      }
                      placeholder="Nome do seu negócio"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company-email"
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                          setDataState((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={15}
                        placeholder="(11) 99999-9999"
                        value={formatPhone(data.phone ?? "")}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="company-website">Website (opcional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company-website"
                        value={data.website}
                        onChange={(e) =>
                          setDataState((prev) => ({ ...prev, website: e.target.value }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-4  border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Financeiro</h3>
                  <p className="text-sm text-muted-foreground">
                    Formas de pagamento e taxas
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium mb-3">Formas de pagamento aceitas</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-medium">Dinheiro</span>
                    </div>
                    <Switch
                      checked={hasAcceptedPaymentMethod("CASH")}
                      onCheckedChange={(checked) =>
                        handlePaymentMethodChange("CASH", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium">Cartão de Débito</span>
                    </div>
                    <Switch
                      checked={hasAcceptedPaymentMethod("DEBIT")}
                      onCheckedChange={(checked) =>
                        handlePaymentMethodChange("DEBIT", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium">Cartão de Crédito</span>
                    </div>
                    <Switch
                      checked={hasAcceptedPaymentMethod("CREDIT")}
                      onCheckedChange={(checked) =>
                        handlePaymentMethodChange("CREDIT", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-medium">PIX</span>
                    </div>
                    <Switch
                      checked={hasAcceptedPaymentMethod("PIX")}
                      onCheckedChange={(checked) =>
                        handlePaymentMethodChange("PIX", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Comodidades</h3>
                  <p className="text-sm text-muted-foreground">
                    Recursos e facilidades oferecidos pela empresa
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium mb-3">Comodidades disponíveis</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Baby className="w-5 h-5 text-primary" />
                      <span className="font-medium">Aceita crianças</span>
                    </div>
                    <Switch
                      checked={hasAmenity("ACCEPTS_CHILDREN")}
                      onCheckedChange={(checked) =>
                        handleAmenityChange("ACCEPTS_CHILDREN", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-primary" />
                      <span className="font-medium">Wi-Fi</span>
                    </div>
                    <Switch
                      checked={hasAmenity("WIFI")}
                      onCheckedChange={(checked) =>
                        handleAmenityChange("WIFI", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-primary" />
                      <span className="font-medium">Estacionamento</span>
                    </div>
                    <Switch
                      checked={hasAmenity("PARKING")}
                      onCheckedChange={(checked) =>
                        handleAmenityChange("PARKING", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Puzzle className="w-5 h-5 text-primary" />
                      <span className="font-medium">Aceita autistas</span>
                    </div>
                    <Switch
                      checked={hasAmenity("ACCEPTS_AUTISTIC")}
                      onCheckedChange={(checked) =>
                        handleAmenityChange("ACCEPTS_AUTISTIC", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Accessibility className="w-5 h-5 text-primary" />
                      <span className="font-medium">Acessibilidade</span>
                    </div>
                    <Switch
                      checked={hasAmenity("ACCESSIBILITY")}
                      onCheckedChange={(checked) =>
                        handleAmenityChange("ACCESSIBILITY", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PawPrint className="w-5 h-5 text-primary" />
                      <span className="font-medium">Pet friendly</span>
                    </div>
                    <Switch
                      checked={hasAmenity("PET_FRIENDLY")}
                      onCheckedChange={(checked) =>
                        handleAmenityChange("PET_FRIENDLY", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              className={`h-14 w-14 rounded-full p-0 shadow-lg transition-all ${
                hasPendingChanges
                  ? "bg-primary hover:bg-primary/90 animate-pulse ring-4 ring-primary/20 scale-105"
                  : "bg-primary/80 hover:bg-primary/90"
              }`}
              onClick={handleSaveData}
              disabled={isSaving}
            >
              <Save className="size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={4} className="bg-primary fill-primary">
            {isSaving
              ? "Salvando alterações"
              : hasPendingChanges
                ? "Você tem alterações pendentes"
                : "Tudo salvo!"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
