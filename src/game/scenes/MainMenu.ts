import { Scene, GameObjects } from 'phaser';

// TODO: Reference link for follow-up info — revisit and replace with details.
// https://youtube.com/shorts/6W-XmjbmqcQ?si=L0ZcDkjRqoHPPSpW
const REFERENCE_LINK = 'https://youtube.com/shorts/6W-XmjbmqcQ?si=L0ZcDkjRqoHPPSpW';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    referenceLink: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // TODO: Reminder link — come back and add more info about this reference.
        this.referenceLink = this.add.text(512, 740, REFERENCE_LINK, {
            fontFamily: 'Arial', fontSize: 14, color: '#ffff66',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
