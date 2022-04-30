export class Interface {
    renderHealthbar(value: number) {
        const healthbar = document.getElementById('healthbar-active')!;
        healthbar.style.width = `${100 * value}%`;
    }
}