from django.core.management.base import BaseCommand
import pandas as pd
import os
import re
from songdecks.models import KeywordType, KeywordPair

class Command(BaseCommand):
    help = 'Parse and count game abilities from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('file_name', type=str, help='CSV file name in the data directory')
        parser.add_argument('--header', action='store_true', help='Indicate if the CSV file has a header row')
        parser.add_argument('--min_count', type=int, default=0, help='Minimum count to display abilities')
        parser.add_argument('--percentile', type=int, default=None, help='Top percentile of abilities to display (1-100)')
        parser.add_argument('--delete', action='store_true', help='Delete existing KeywordPairs and KeywordTypes before processing')

    def handle(self, *args, **kwargs):
        self.stdout.write("\n")
        file_name = kwargs['file_name']
        has_header = kwargs['header']
        min_count = kwargs['min_count']
        percentile = kwargs['percentile']
        delete = kwargs['delete']

        if min_count > 0 and percentile != None:
            self.stderr.write("Error: Cannot use both min_count and percentile options at the same time.")
            return

        file_path = os.path.join(os.path.dirname(__file__), '../../data', file_name)

        # Check if the file exists
        if not os.path.exists(file_path):
            self.stderr.write(f"Error: The file {file_path} does not exist.")
            return

        try:
            # Read the CSV file
            df = self.read_csv(file_path, has_header)

            # Check if the DataFrame is empty
            if df.empty:
                self.stdout.write("The CSV file is empty.")
                return

            # Count abilities
            order_counts, regular_counts = self.count_abilities(df)

            if percentile is not None:
                order_counts = self.filter_top_percentile(order_counts, percentile)
                regular_counts = self.filter_top_percentile(regular_counts, percentile)
            else:
                order_counts = order_counts[order_counts >= min_count]
                regular_counts = regular_counts[regular_counts >= min_count]

            self.process_abilities(order_counts, regular_counts, delete)
        
        except pd.errors.EmptyDataError:
            self.stderr.write("Error: The CSV file is empty.")
        except pd.errors.ParserError:
            self.stderr.write("Error: There was a problem parsing the CSV file.")
        except Exception as e:
            self.stderr.write(f"An unexpected error occurred: {e}")

    def read_csv(self, file_path, has_header):
        if has_header:
            return pd.read_csv(file_path)  # Assumes the first row is a header
        else:
            return pd.read_csv(file_path, header=None)

    def count_abilities(self, df):
        abilities = df[df.columns[0]].str.split('/').explode().str.strip()

        # Remove text within parentheses and filter out abilities with single quotes
        abilities_processed = abilities.apply(lambda x: re.sub(r"\(.*?\)", "", x))
        abilities_processed = abilities_processed[~abilities_processed.str.contains("'")]

        # Process each order to keep text after "Order: "
        orders_processed = abilities_processed[abilities_processed.str.startswith("Order: ")]
        orders = orders_processed.apply(lambda x: x.replace("Order: ", "")).str.strip()

        # Process each ability to keep text before ":"
        abilities_processed = abilities_processed.apply(lambda x: x.split(':')[0] if ':' in x else x).str.strip()

        # Split into Orders and regular abilities
        regular_abilities = abilities_processed[~abilities_processed.str.startswith("Order: ")]

        # Count each group
        order_counts = orders.value_counts()
        regular_counts = regular_abilities.value_counts()

        return order_counts, regular_counts

    def print_counts(self, title, counts):
        self.stdout.write(f"{title}:")
        for ability, count in counts.items():
            self.stdout.write(f"{ability} ({count})")

    def filter_top_percentile(self, counts, percentile):
        if percentile <= 0 or percentile > 100:
            raise ValueError("Percentile must be between 1 and 100")

        threshold_index = int(len(counts) * (percentile / 100))
        top_counts = counts.nlargest(threshold_index)
        return top_counts
    
    def process_ability_group(self, abilities, delete, keyword_type=None):
        created = []
        verified = []
        deleted = []
        for ability in abilities.index:
            if delete:
                KeywordPair.objects.filter(keyword=ability).delete()
                deleted.append(ability)
            else:
                obj, created_flag = KeywordPair.objects.get_or_create(
                    keyword=ability, 
                    defaults={'description': 'Auto-generated', 'keyword_type': keyword_type}
                )
                if created_flag:
                    created.append(ability)
                else:
                    verified.append(ability)
        return created, verified, deleted

    def print_ability_group(self, title, abilities):
        self.stdout.write(f"{title} ({len(abilities)}):")
        for ability in abilities:
            self.stdout.write(f"{ability}")
        self.stdout.write("\n")

    def process_abilities(self, order_counts, regular_counts, delete):
        # Get or create the 'Order' KeywordType
        order_type, _ = KeywordType.objects.get_or_create(name='Order', defaults={'description': 'Order type'})

        # Process and track Order abilities
        created_orders, verified_orders, deleted_orders = self.process_ability_group(order_counts, delete, order_type)

        # Process and track regular abilities
        created_regular, verified_regular, deleted_regular = self.process_ability_group(regular_counts, delete)

        # Print created and verified abilities
        if delete:
            self.print_ability_group("Deleted Orders", deleted_orders)
            self.print_ability_group("Deleted Regular Abilities", deleted_regular)
        else:
            self.print_ability_group("Created Orders", created_orders)
            self.print_ability_group("Verified Orders", verified_orders)
            self.print_ability_group("Created Regular Abilities", created_regular)
            self.print_ability_group("Verified Regular Abilities", verified_regular)