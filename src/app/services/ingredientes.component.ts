import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredientesService,Ingrediente } from './ingredientes.service'; 
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-ingredientes',
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule],
  template: `
    <h2>Ingredientes</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <input type="text" placeholder="Nombre" formControlName="nombre" />
      <input type="number" placeholder="Precio" formControlName="precio" />
      <input type="text" placeholder="Unidad" formControlName="unidad" />
      <button type="submit">{{ idEditando ? 'Actualizar' : 'Agregar' }}</button>
      <button type="button" *ngIf="idEditando" (click)="cancelarEdicion()">Cancelar</button>
    </form>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Unidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let ing of ingredientes">
          <td>{{ ing.nombre }}</td>
          <td>{{ ing.precio }}</td>
          <td>{{ ing.unidad }}</td>
          <td>
            <button (click)="editar(ing)">Editar</button>
            <button (click)="eliminar(ing.id!)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class IngredientesComponent implements OnInit {
  ingredientes: Ingrediente[] = [];
  form: FormGroup;
  idEditando: number | null = null;

  constructor(
    private ingredientesService: IngredientesService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      unidad: ['']
    });
  }

  ngOnInit(): void {
    this.cargarIngredientes();
  }

  cargarIngredientes() {
    this.ingredientesService.getIngredientes().subscribe(data => {
      this.ingredientes = data;
    });
  }

  guardar() {
    if (this.form.invalid) return;

    const ingrediente: Ingrediente = {
      id: this.idEditando ?? undefined,
      ...this.form.value
    };

    const request$ = this.idEditando
      ? this.ingredientesService.updateIngrediente(ingrediente)
      : this.ingredientesService.addIngrediente(ingrediente);

    request$.subscribe(() => {
      this.cancelarEdicion();
      this.cargarIngredientes();
    });
  }

  editar(ingrediente: Ingrediente) {
    this.idEditando = ingrediente.id!;
    this.form.setValue({
      nombre: ingrediente.nombre,
      precio: ingrediente.precio,
      unidad: ingrediente.unidad
    });
  }

  cancelarEdicion() {
    this.idEditando = null;
    this.form.reset({ nombre: '', precio: 0, unidad: '' });
  }

  eliminar(id: number) {
    this.ingredientesService.deleteIngrediente(id).subscribe(() => {
      this.ingredientes = this.ingredientes.filter(i => i.id !== id);
    });
  }
}
