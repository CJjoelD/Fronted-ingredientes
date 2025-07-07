import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-conversor',
  templateUrl: './conversor.html',
  styleUrls: ['./conversor.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ConversorComponent {
  form: FormGroup; 
  formIngrediente: FormGroup; 

  resultadoKg: number | null = null; 
  pesoKg: number | null = null; 

  ingredientes: any[] = [];
  editando: boolean = false;
  editandoId: number | null = null;

  @Output() resultadoCambio = new EventEmitter<number>();

  constructor(private fb: FormBuilder) {
    // Formulario del conversor individual
    this.form = this.fb.group({
      valor: [null, [Validators.required, Validators.min(0.001)]],
      unidad: ['g', Validators.required]
    });

    this.formIngrediente = this.fb.group({
      nombre: ['', Validators.required],
      precio: [null, Validators.required],
      unidad: ['', Validators.required],
      peso: [null, Validators.required],
      unidadPeso: ['g', Validators.required]
    });
  }

  convertir() {
    const valor = this.form.value.valor;
    const unidad = this.form.value.unidad;

    let kg = this.convertirAKg(valor, unidad);
    this.resultadoKg = kg;
    this.resultadoCambio.emit(kg);
  }

  limpiar() {
    this.form.reset({ unidad: 'g' });
    this.resultadoKg = null;
  }

  guardar() {
    const data = this.formIngrediente.value;
    const pesoKg = this.convertirAKg(data.peso, data.unidadPeso);
    data.pesoKg = pesoKg;

    if (this.editandoId !== null) {
      const index = this.ingredientes.findIndex(i => i.id === this.editandoId);
      if (index !== -1) this.ingredientes[index] = { ...data, id: this.editandoId };
      this.editandoId = null;
      this.editando = false;
    } else {
      data.id = Date.now();
      this.ingredientes.push(data);
    }

    this.pesoKg = pesoKg;
    this.formIngrediente.reset({ unidadPeso: 'g' });
  }

  editar(ing: any) {
    this.formIngrediente.patchValue(ing);
    this.editando = true;
    this.editandoId = ing.id;
  }

  eliminar(id: number) {
    this.ingredientes = this.ingredientes.filter(i => i.id !== id);
    this.cancelarEdicion();
  }

  cancelarEdicion() {
    this.formIngrediente.reset({ unidadPeso: 'g' });
    this.editando = false;
    this.editandoId = null;
  }

  convertirAKg(peso: number, unidad: string): number {
    switch (unidad) {
      case 'mg': return peso / 1_000_000;
      case 'kg': return peso / 1000;
      case 'lb': return peso * 0.453592;
      case 'oz': return peso * 0.0283495;
      default: return peso;
    }
  }
}
