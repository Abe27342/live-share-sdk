import * as React from "react";
import { useSharedTree, useTreeNode } from "@microsoft/live-share-react";
import { TreeViewConfiguration, ImplicitFieldSchema, TreeView, TreeFieldFromImplicitField } from "fluid-framework";
import { FC } from "react";
import { Note, Notes } from "./ExampleSharedTree-schema";
import { Button, Textarea } from "@fluentui/react-components";

// Export the tree config appropriate for this schema.
// This is passed into the SharedTree when it is initialized.
export const appTreeConfiguration = new TreeViewConfiguration(
    // Schema for the root
    { schema: Notes }
);

function useViewRoot<TSchema extends ImplicitFieldSchema>(
	view: TreeView<TSchema> | undefined,
): TreeFieldFromImplicitField<TSchema> | undefined {
	const [root, setRoot] = React.useState<TreeFieldFromImplicitField<TSchema> | undefined>(
		undefined,
	);

	React.useEffect(() => {
		const updateRoot = (): void => {
			if (view?.compatibility.canView) {
				setRoot(view.root);
			} else {
				setRoot(undefined);
			}
		};

		updateRoot();
		return view?.events.on("rootChanged", updateRoot);
	}, [view]);

	return root;
}

// Statically defining this *might* work, but I'm not totally sure and it seems like
// a better API would be useSharedTree("my-tree", appTreeConfiguration, () => new Notes([])).
// const initialData = new Notes([]);

export const ExampleSharedTree: FC = () => {
    const { treeView } = useSharedTree(
        "my-tree",
        appTreeConfiguration,
        new Notes([])
    );
    const notes = useViewRoot(treeView);
    // Note that inval on useTreeNode isn't fully implemented right now, and return value is unusable.
    useTreeNode(notes);

    if (!treeView) {
        return <>Loading tree...</>
    }
    if (!notes) {
        return <>Loading notes...</>;
    }
    return (
        <div>
            <div>
                <Button
                    onClick={() => {
                        notes.addNode("Me");
                    }}
                >
                    {"Add note"}
                </Button>
            </div>
            {notes.map((note) => (
                <ExampleNoteSticky key={note.id} note={note} />
            ))}
        </div>
    );
};

interface IExampleNoteStickyProps {
    note: Note;
}

const ExampleNoteSticky: FC<IExampleNoteStickyProps> = ({ note }) => {
    useTreeNode(note);
    const noteNode = note;
    return (
        <div>
            <Textarea
                value={noteNode.text}
                onChange={(ev, data) => {
                    note.text = data.value;
                }}
            />
            {noteNode.author}
        </div>
    );
};
